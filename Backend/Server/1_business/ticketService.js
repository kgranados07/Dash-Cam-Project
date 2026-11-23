// Business layer: handles logic (hidden from UI/ frontend)
const TicketRepo = require("../2_persistence/ticketRepository");

// Input validation: Checks whether the id is valid or not
exports.getTicketById = async (id) => {
    if(!id || id <=0) {
        throw new Error("Invalid Ticket ID bruh 😭");
    }
    const ticket = await TicketRepo.findById(id); // Calls orderRepo.findById(id) next layer(2_persistence)
    return ticket; // Passes the retrieved order back to the upper layer (0_presentation)
};

exports.getTickets = async () => TicketRepo.findAll();

exports.updatePaidStatus = async (id, isPaid) => {
    const ticketId = Number(id);
    const paidValue = Number(isPaid);
    if (!Number.isSafeInteger(ticketId) || ticketId <= 0) {
        throw new Error("Invalid ticket: id must be a positive integer");
    }
    if (!Number.isInteger(paidValue) || (paidValue !== 0 && paidValue !== 1)) {
        throw new Error("Invalid ticket: is_paid must be 0 or 1");
    }
    return TicketRepo.updatePaidStatus(ticketId, paidValue);
};

exports.createTicket = async (input) => {
    const ticket = {
        user_id: input?.user_id == null ? null : Number(input.user_id),
        violation: input?.violation,
        street_loc: input?.street_loc ?? input?.street_location,
        price: Number(input?.price),
        is_paid: input?.is_paid == null ? 0 : Number(input.is_paid),
        inrealtime: input?.inrealtime == null ? null : String(input.inrealtime),
    };
    if (ticket.user_id !== null && (!Number.isSafeInteger(ticket.user_id) || ticket.user_id <= 0)) {
        throw new Error("Invalid ticket: user_id must be a positive integer");
    }
    if (typeof ticket.violation !== "string" || !ticket.violation.trim()) {
        throw new Error("Invalid ticket: violation is required");
    }
    if (typeof ticket.street_loc !== "string" || !ticket.street_loc.trim()) {
        throw new Error("Invalid ticket: street_loc is required");
    }
    if (!Number.isFinite(ticket.price) || ticket.price < 0) {
        throw new Error("Invalid ticket: price must be a non-negative number");
    }
    if (!Number.isInteger(ticket.is_paid) || (ticket.is_paid !== 0 && ticket.is_paid !== 1)) {
        throw new Error("Invalid ticket: is_paid must be 0 or 1");
    }
    return TicketRepo.insert(ticket);
};