import os
import shutil
import subprocess
import sys
from pathlib import Path
import struct


ROOT = Path(__file__).resolve().parent
DESKTOP = Path(os.path.join(os.environ.get("USERPROFILE", str(ROOT)), "Desktop"))
APP_NAME = "Marco Cheat GUI"
DIST_DIR = ROOT / "dist"


def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


def run(cmd: str):
    print(f"\n>>> {cmd}")
    completed = subprocess.run(cmd, shell=True)
    if completed.returncode != 0:
        print(f"Command failed with code {completed.returncode}: {cmd}")
        sys.exit(completed.returncode)


def ensure_tools():
    # Ensure Node and npm exist
    for tool in ("node -v", "npm -v"):
        try:
            subprocess.check_call(tool, shell=True)
        except subprocess.CalledProcessError:
            print("Node.js/npm not found. Please install Node.js from https://nodejs.org and re-run.")
            sys.exit(1)


def build_react():
    # Clean install to avoid "react-scripts not recognized"
    if (ROOT / "node_modules").exists():
        print("Cleaning existing node_modules (if you have local patches, cancel now)...")
    # Install with legacy peer deps to avoid transient conflicts
    run("npm install --legacy-peer-deps")

    # Build React app (CRA)
    # Using npx ensures the right react-scripts version even if path isn't set
    run("npx react-scripts@5.0.1 build")
    # Verify build output exists
    build_index = ROOT / "build" / "index.html"
    if not build_index.exists():
        print("React build missing: build/index.html was not created.")
        sys.exit(1)


def package_electron():
    # Ensure electron-packager is available
    run("npm install --save-dev electron-packager@^17 --force")

    # Package the app (load build/index.html from main.js)
    def is_valid_ico(p: Path) -> bool:
        try:
            with open(p, 'rb') as f:
                header = f.read(6)
            if len(header) < 6:
                return False
            reserved, ico_type, count = struct.unpack('<HHH', header)
            return reserved == 0 and ico_type == 1 and count > 0
        except Exception:
            return False

    icon_path = ROOT / "public" / "icon.ico"
    use_icon = icon_path.exists() and icon_path.stat().st_size > 0 and is_valid_ico(icon_path)
    if not use_icon:
        print("Note: Skipping icon because public/icon.ico is missing or invalid. You can replace it with a valid .ico later.")

    icon_arg = f"--icon=\"{icon_path}\"" if use_icon else ""
    cmd = f"npx electron-packager . \"{APP_NAME}\" --platform=win32 --arch=x64 --out=dist --overwrite {icon_arg}".strip()
    run(cmd)


def copy_app_to_desktop():
    # Copy the entire packaged directory to Desktop so dependent DLLs (e.g., ffmpeg.dll) are present
    app_folder = DIST_DIR / f"{APP_NAME}-win32-x64"
    exe_path = app_folder / f"{APP_NAME}.exe"
    if not exe_path.exists():
        print("Could not find the packaged app. Contents of dist:")
        for p in DIST_DIR.glob("**/*"):
            print(" -", p)
        print("\nMake sure packaging succeeded.")
        sys.exit(1)

    DESKTOP.mkdir(parents=True, exist_ok=True)
    target_dir = DESKTOP / f"{APP_NAME}"
    if target_dir.exists():
        try:
            shutil.rmtree(target_dir)
        except Exception:
            pass
    shutil.copytree(app_folder, target_dir)

    print(f"\nPlaced app folder on Desktop: {target_dir}")
    print(f"Run: {target_dir / (APP_NAME + '.exe')}")


def main():
    clear_screen()
    print("Starting desktop build and package...")
    ensure_tools()
    build_react()
    package_electron()
    copy_app_to_desktop()
    print("\nAll done! You can double-click the exe on your Desktop.")


if __name__ == "__main__":
    main()
