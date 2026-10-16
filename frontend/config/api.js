// Placeholder API config.
// Once Kevin's Flask/FastAPI server is running, just update BASE_URL below.
// Nothing else in the app needs to change.

export const BASE_URL = "http://localhost:5000"; // swap for real server URL later

export async function fetchTickets() {
  // TODO: replace with real fetch once backend exists
  // return fetch(`${BASE_URL}/tickets`).then(res => res.json());

  // For now, return mock data so the UI can be built and tested
  return mockTickets;
}

export const mockTickets = [
  {
    id: "1",
    type: "Stop Sign Violation",
    zone: "Intersection A",
    time: "10:32:15",
    status: "Unpaid",
    rule: "Full stop, 2 seconds",
  },
  {
    id: "2",
    type: "Speeding (School Zone)",
    zone: "Zone 1",
    time: "10:35:42",
    status: "Unpaid",
    rule: "15 mph school zone limit",
  },
  {
    id: "3",
    type: "Parking Violation",
    zone: "Parking Zone B",
    time: "10:40:21",
    status: "Paid",
    rule: "No stopping over 5 min",
  },
];
