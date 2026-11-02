const EventService = require("../1_business/eventService");

exports.getEvent = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        const event = await EventService.getEventById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        return res.json(event);
    } catch (err) {
        console.error("GET event error:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.postEvent = async (req, res) => {
    try {
        const event = await EventService.createEvent(req.body);
        return res.status(201).json(event);
    } catch (err) {
        if (err.message.startsWith("Invalid event:")) {
            return res.status(400).json({ message: err.message });
        }
        console.error("POST event error:", err.message);
        return res.status(500).json({ message: "Could not save event" });
    }
};
