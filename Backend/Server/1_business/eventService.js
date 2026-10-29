// Business layer: handles logic (hidden from UI/ frontend)
const EventRepo = require("../2_persistence/eventRepository");

// Input validation: Checks whether the id is valid or not
exports.getEventById = async (id) => {
    if(!id || id <=0) {
        throw new Error("Invalid Event ID bruh 😭");
    }
    const event = await EventRepo.findById(id); // Calls orderRepo.findById(id) next layer(2_persistence)
    return event; // Passes the retrieved order back to the upper layer (0_presentation)
};