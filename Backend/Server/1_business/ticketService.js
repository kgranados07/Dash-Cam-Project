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

exports.createTicket = async (input) => {
    const ticket = {
        user_id: input?.user_id == null ? null : Number(input.user_id),
        violation: input?.violation,
        street_location: input?.street_location,
        price: Number(input?.price),
    };
    if (ticket.user_id !== null && (!Number.isSafeInteger(ticket.user_id) || ticket.user_id <= 0)) {
        throw new Error("Invalid ticket: user_id must be a positive integer");
    }
    if (typeof ticket.violation !== "string" || !ticket.violation.trim()) {
        throw new Error("Invalid ticket: violation is required");
    }
    if (typeof ticket.street_location !== "string" || !ticket.street_location.trim()) {
        throw new Error("Invalid ticket: street_location is required");
    }
    if (!Number.isFinite(ticket.price) || ticket.price < 0) {
        throw new Error("Invalid ticket: price must be a non-negative number");
    }
    return TicketRepo.insert(ticket);
};