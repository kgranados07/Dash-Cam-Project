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