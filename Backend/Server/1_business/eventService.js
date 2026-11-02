const EventRepo = require("../2_persistence/eventRepository");

exports.getEventById = async (id) => {
    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid Event ID");
    return EventRepo.findById(id);
};

exports.createEvent = async (input) => {
    const event = {
        event_type: input?.event_type,
        street_location: input?.street_location,
        latitude: Number(input?.latitude),
        longitude: Number(input?.longitude),
        video_number: input?.video_number,
        timestamp: input?.timestamp,
        timestamp_seconds: input?.timestamp_seconds == null ? null : Number(input.timestamp_seconds),
        frame: input?.frame == null ? null : Number(input.frame),
    };
    if (typeof event.event_type !== "string" || !event.event_type.trim()) throw new Error("Invalid event: event_type is required");
    if (typeof event.street_location !== "string" || !event.street_location.trim()) throw new Error("Invalid event: street_location is required");
    if (!Number.isFinite(event.latitude) || event.latitude < -90 || event.latitude > 90) throw new Error("Invalid event: latitude must be between -90 and 90");
    if (!Number.isFinite(event.longitude) || event.longitude < -180 || event.longitude > 180) throw new Error("Invalid event: longitude must be between -180 and 180");
    if (typeof event.video_number !== "string" || !event.video_number.trim()) throw new Error("Invalid event: video_number is required");
    if (typeof event.timestamp !== "string" || !event.timestamp.trim()) throw new Error("Invalid event: timestamp is required");
    if (event.timestamp_seconds !== null && !Number.isFinite(event.timestamp_seconds)) throw new Error("Invalid event: timestamp_seconds must be numeric");
    if (event.frame !== null && (!Number.isInteger(event.frame) || event.frame < 0)) throw new Error("Invalid event: frame must be a non-negative integer");
    return EventRepo.insert(event);
};
