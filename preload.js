const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  startMacro: () => ipcRenderer.invoke('macro:start'),
  stopMacro: () => ipcRenderer.invoke('macro:stop'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onWindowMove: (callback) => {
    const listener = (_event, delta) => callback(delta);
    ipcRenderer.on('window-move', listener);
    return () => ipcRenderer.removeListener('window-move', listener);
  },
});

