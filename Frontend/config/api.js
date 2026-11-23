// Use your computer's LAN IP instead of localhost when testing on a physical device.
export const API_BASE_URL = "https://dash-cam-project.onrender.com";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    throw new Error(`Could not reach ${API_BASE_URL}: ${error.message}`);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }
  return body;
}

function toTicketModel(ticket) {
  const violation = ticket.violation || "Traffic violation";
  return {
    ...ticket,
    id: String(ticket.id),
    type: violation,
    realtime: ticket.inrealtime == null ? "Not specified" : String(ticket.inrealtime),
    zone: ticket.street_loc || "Location unavailable",
    rule: violation,
    status: Number(ticket.is_paid) === 1 ? "Paid" : "Unpaid",
    price: Number(ticket.price ?? 0),
  };
}

export async function fetchTickets() {
  const tickets = await request("/tickets");
  if (!Array.isArray(tickets)) throw new Error("Ticket API returned an invalid response");
  return tickets.map(toTicketModel);
}

export async function updateTicketPayment(id, isPaid) {
  const ticket = await request(`/tickets/${encodeURIComponent(id)}/payment`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_paid: isPaid ? 1 : 0 }),
  });
  return toTicketModel(ticket);
}