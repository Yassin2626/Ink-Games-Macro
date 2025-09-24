import keyboard
import time
import signal
import sys

_running = True

def _signal_handler(signum, frame):
    global _running
    _running = False

def spam_key(key):
    end_time = time.time() + 0.15
    while _running and time.time() < end_time:
        keyboard.press_and_release(key.lower())
        time.sleep(0.005)

def on_key_press(event):
    key = event.name.upper()
    if key in ['Q', 'R', 'E', 'F']:
        spam_key(key)

def main():
    global _running
    # Register clean exit on signals
    signal.signal(signal.SIGINT, _signal_handler)
    try:
        signal.signal(signal.SIGTERM, _signal_handler)
    except Exception:
        pass

    print("Monitoring keyboard inputs. Close the GUI to stop.")
    keyboard.on_press(on_key_press)

    try:
        while _running:
            time.sleep(0.05)
    finally:
        try:
            keyboard.unhook_all()
        except Exception:
            pass
        print("Macro stopped.")
        sys.exit(0)

if __name__ == "__main__":
    main()
