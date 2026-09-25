# Ticket App (AI Dashcam Project — Front End)

Mobile app front end for the toy-car AI dashcam project. Detects driving
violations on the track and displays them as tickets you can view, pay,
or contest.

## Team
- **Lily-Anna Quintero** — Leader / Document Lead
- **Veronica Dawson** — Front End (this app)
- **Kevin Granados** — Back End / Detection
- **Anna** — Database

## Getting started

1. Install dependencies:
   ```
   npm install
   ```
2. Start the app:
   ```
   npx expo start
   ```
3. Scan the QR code with the **Expo Go** app on your phone (iOS/Android)
   to run it live.

## Project structure

```
App.js                        # Navigation setup (tabs + stack)
screens/
  TicketListScreen.js          # Ticket list with All/Unpaid/Paid/Contested tabs
  TicketDetailScreen.js        # Ticket detail view (time, location, pay/contest)
  EvidenceScreen.js            # Full-screen photo/video evidence view
config/
  api.js                       # API config + mock ticket data
```

## Backend connection

Right now the app uses mock data from `config/api.js`. Once the backend
server (Flask/FastAPI) is live, update `BASE_URL` in that file and swap
the mock `fetchTickets()` for the real `fetch()` call already commented
in there — no other code changes needed.

<img width="1847" height="832" alt="image" src="https://github.com/user-attachments/assets/a85948fc-c602-41cb-ac25-cb8f5822fe21" />

## Status

- [x] Week 1: Dev environment set up
- [x] Week 2: Ticket list + tabs screen
- [x] Week 3: Ticket detail + evidence wireframes finalized
- [ ] Week 4+: Wire up to live backend
