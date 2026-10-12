# Background Dashcam Recording + QR Analysis

## What it does
- Records video in consecutive 30-second MP4 segments.
- Starts analyzing a segment as soon as the recorder closes that segment.
- Keeps recording while analysis runs in the main controller thread.
- Does not create OpenCV display windows.
- Saves each QR payload only once per controller run, even if it appears in
  multiple frames or later video segments.
- Appends detections to `qr_results.json`.

## Install
```bash
python -m pip install opencv-python
```

## Run
Put `record.py`, `analyze.py`, and `controller.py` in the same directory, then:
```bash
python controller.py
```
Stop with Ctrl+C in the terminal. The process has no camera preview window, but
it does run as a process attached to the terminal. To launch it detached on
Windows, use:
```powershell
Start-Process pythonw -ArgumentList "controller.py" -WorkingDirectory "C:\path\to\folder"
```
To stop a detached `pythonw` process, use Task Manager or run:
```powershell
Get-CimInstance Win32_Process -Filter "Name = 'pythonw.exe'"
Stop-Process -Id <PID>
```
On Linux, you can run it detached with:
```bash
nohup python3 controller.py >/tmp/dashcam.log 2>&1 &
```
Find and stop it with:
```bash
pgrep -af controller.py
kill <PID>
```

## Notes
- Change `CAMERA = 0` in `record.py` if your webcam uses a different camera index.
- `qr_results.json` is shared across runs. QR payloads already present in this
  file are skipped, so deduplication persists across controller restarts.
- Video files remain in `recordings/`. Delete them only after confirming that
  analysis has completed and you no longer need the footage.
- QR payloads are treated as identical when their decoded text matches exactly.
  The controller also loads codes already in `qr_results.json`, so previously
  logged payloads will not be logged again after restarting it. To allow a code
  to be logged again, remove its entry from `qr_results.json` (or back up and
  clear that file before starting a new session).
