// config/api.js
const BASE_URL = "http://YOUR_BACKEND_IP:5000"; // Flask/FastAPI server address

export async function fetchTickets() {
  const response = await fetch(`${BASE_URL}/tickets`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.status}`);
  }
  return response.json();
}

//ticketlist
import { fetchTickets } from './config/api';

useEffect(() => {
  fetchTickets()
    .then(setTickets)
    .catch(err => console.error("Failed to load tickets:", err));
}, []);