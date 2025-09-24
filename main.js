const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync, exec } = require('child_process');

let mainWindow;
let pythonProc = null;
let lastPos = { x: 0, y: 0 };

function findPython() {
  const candidates = [];
  if (process.env.PYTHON_PATH) candidates.push({ cmd: process.env.PYTHON_PATH, args: ['-V'] });
  if (process.platform === 'win32') candidates.push({ cmd: 'py', args: ['-3', '-V'] }, { cmd: 'py', args: ['-V'] });
  candidates.push({ cmd: 'python', args: ['-V'] }, { cmd: 'python3', args: ['-V'] });
  for (const c of candidates) {
    try {
      const r = spawnSync(c.cmd, c.args, { stdio: 'ignore' });
      if (r.status === 0) return c;
    } catch {}
  }
  return null;
}

function startMacro() {
  if (pythonProc) return { ok: true };
  const py = findPython();
  if (!py) return { ok: false, error: 'Python not found. Install Python 3 or set PYTHON_PATH.' };
  // Ensure Macro.py is accessible on disk (outside asar) by copying to userData
  const userDataDir = app.getPath('userData');
  const packagedScript = path.join(__dirname, 'Macro.py');
  const script = path.join(userDataDir, 'Macro.py');
  try {
    const src = fs.readFileSync(packagedScript);
    try { fs.mkdirSync(userDataDir, { recursive: true }); } catch {}
    fs.writeFileSync(script, src);
  } catch (e) {
    return { ok: false, error: 'Unable to access Macro.py: ' + (e && e.message ? e.message : String(e)) };
  }
  const args = py.cmd === 'py' ? [...py.args.slice(0, 1), script] : [script];
  try {
    pythonProc = spawn(py.cmd, args, { cwd: __dirname, stdio: 'ignore' });
    pythonProc.on('exit', () => { pythonProc = null; });
    return { ok: true };
  } catch (e) {
    pythonProc = null;
    return { ok: false, error: String(e && e.message || e) };
  }
}

function stopMacro() {
  if (!pythonProc) return;
  try {
    pythonProc.kill();
  } catch (e) {
    // fallthrough
  }
  if (process.platform === 'win32' && pythonProc && pythonProc.pid) {
    exec(`taskkill /pid ${pythonProc.pid} /T /F`, () => {});
  }
  pythonProc = null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 480,
    useContentSize: true,
    resizable: false,
    frame: true, // native minimize/close
    autoHideMenuBar: true, // hide menu bar (File/Edit...)
    show: false, // show after ready-to-show
    backgroundColor: '#111318',
    title: 'Marco Cheat GUI',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load dev server in dev, or build in prod
  const devUrl = process.env.ELECTRON_START_URL;
  if (devUrl && devUrl.startsWith('http')) {
    mainWindow.loadURL(devUrl);
  } else {
    // Load built app from build/index.html
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  // Remove any default application menu completely
  try { Menu.setApplicationMenu(null); } catch {}

  // Track window movement and send to renderer
  try {
    const [x, y] = mainWindow.getPosition();
    lastPos = { x, y };
  } catch {}
  mainWindow.on('move', () => {
    try {
      const [x, y] = mainWindow.getPosition();
      const delta = { dx: x - lastPos.x, dy: y - lastPos.y, x, y };
      lastPos = { x, y };
      mainWindow.webContents.send('window-move', delta);
    } catch {}
  });

  mainWindow.on('close', () => {
    stopMacro();
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Open dev tools in development mode
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // Helpful diagnostics if anything fails to load
  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('Load failed', { code, desc, url });
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  stopMacro();
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('macro:start', async () => {
  return startMacro();
});

ipcMain.handle('macro:stop', async () => {
  stopMacro();
  return { ok: true };
});

ipcMain.handle('open-external', async (_event, url) => {
  try {
    await shell.openExternal(url);
    return { ok: true };
  } catch (error) {
    console.error('Failed to open external URL:', error);
    return { ok: false, error: error.message };
  }
});
