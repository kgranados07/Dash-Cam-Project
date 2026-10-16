# Dash-Cam-Project
# AI Dashcam — Ticket App (Team Notes)
# Dash & Ticketed

Mobile front end for our toy-car AI dashcam project. The app watches the
track for driving violations and turns them into tickets you can review,
pay, or dispute — think of it as a mini traffic-court app for a toy car.

## Team

- **Lily-Anna Quintero** — Leader / Documentation / Database
- **Veronica Dawson** — Front End
- **Kevin Granados** — Back End / Detection

## Why this project

Our toy car "drives" a track with a dash cam and detection logic flag
violations (collision, running a stop sign, etc.). This app is the
dashboard drivers would use to see what got flagged and respond to it with paying, contested, or removing it while seeing it live (saved).

## Getting started

1. Install dependencies:
   ```
   npm install
   ```
2. Start the app:
   ```
   npx expo start
   ```
3. Open it on your phone with the **Expo Go** app by scanning the QR
   code, or run it in a simulator.

## Project structure
```
Frontend/                       # Mobile app (React Native / Expo)
  App.js                        # Navigation setup (tabs + stack)
  app.json                      # Expo app settings
  babel.config.js               # Build config for Expo
  package.json                  # Frontend dependencies
  screens/
    TicketListScreen.js         # List of tickets, filterable by status (All/Unpaid/Paid/Contested)
    TicketDetailScreen.js       # Single ticket: time, location, pay/contest
    EvidenceScreen.js           # Full-screen photo/video evidence
  config/
    api.js                      # Backend address + fetchTickets() (mock data until the server is live)

Backend/                        # Detection + API logic
  AprilTagDetect/               # Reads AprilTag/QR markers from the camera (zones, speed)
  Recorder/                     # Camera capture and loop recording
  Server/                       # API server (Flask/FastAPI) the app talks to
  Untitled Diagram.drawio-2.pdf # System diagram

Database/                       # Ticket + evidence storage (SQLite)
  database.js                   # tickets + zones tables; insert, query, update status
  addingtickets.js              # incidents table, loop-recording segments, violation inserts
  looprecording.js              # ffmpeg loop recording that logs segments to the DB
  fixingreading.js              # QR code reading test script (jsQR + ffmpeg)
  list-webcams.js               # Lists connected cameras
  main.py                       # Python helper script
  rename.js                     # File renaming helper

image.png                       # Use case diagram
```

## Connecting to the backend

The app currently runs on mock ticket data so the front end can be built
and tested independently. Once the backend server is live, we'll point
the app at it by updating the base URL and swapping the mock data call
for a real network request, no other screens should need to change.

## Git workflow notes (for my own reference)

- Clone the repo, then always `git pull` before starting new work.
- Make small, focused commits with clear messages.
- Use a branch for anything beyond a tiny fix, then merge back via
  pull request so the team can review.
- If a merge conflict shows up, resolve it manually in the flagged
  file, then `git add` + `git commit` to finish.

<img width="1847" height="832" alt="image" src="https://github.com/user-attachments/assets/a85948fc-c602-41cb-ac25-cb8f5822fe21" />

## Status

- [x] Dev environment set up
- [x] Ticket list + tabs screen
- [x] Ticket detail + evidence screens
- [ ] Wired up to live backend
<<<<<<< HEAD

```
Dash-Cam-Project/
├── frontend/                  
│   ├── App.js
│   ├── app.json
│   ├── babel.config.js
│   ├── package.json
│   ├── screens/
│   │   ├── TicketListScreen.js
│   │   ├── TicketDetailScreen.js
│   │   └── EvidenceScreen.js
│   └── config/
│       └── api.js            
├── backend/                   
│   ├── app.py (or main.py)
│   ├── requirements.txt
│   ├── routes/
│   ├── services/
│   └── detection/             
├── database/                  
│   ├── schema.sql
```
