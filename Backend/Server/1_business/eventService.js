const EventRepo = require("../2_persistence/eventRepository");

exports.getEventById = async (id) => {
    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid Event ID");
    return EventRepo.findById(id);
};

exports.createEvent = async (input) => {
    const suppliedRealtime = input?.inrealtime == null ? null : String(input.inrealtime).trim();
    const event = {
        user_id: input?.user_id == null ? null : Number(input.user_id),
        event_type: input?.event_type,
        street_loc: input?.street_loc ?? input?.street_location,
        latitude: Number(input?.latitude),
        longitude: Number(input?.longitude),
        video_number: input?.video_number,
        timestamp: input?.timestamp,
        timestamp_seconds: input?.timestamp_seconds == null ? null : Number(input.timestamp_seconds),
        frame: input?.frame == null ? null : Number(input.frame),
        inrealtime: suppliedRealtime || new Date().toISOString(),
    };
    if (event.user_id !== null && (!Number.isSafeInteger(event.user_id) || event.user_id <= 0)) throw new Error("Invalid event: user_id must be a positive integer");
    if (typeof event.event_type !== "string" || !event.event_type.trim()) throw new Error("Invalid event: event_type is required");
    if (typeof event.street_loc !== "string" || !event.street_loc.trim()) throw new Error("Invalid event: street_loc is required");
    if (!Number.isFinite(event.latitude) || event.latitude < -90 || event.latitude > 90) throw new Error("Invalid event: latitude must be between -90 and 90");
    if (!Number.isFinite(event.longitude) || event.longitude < -180 || event.longitude > 180) throw new Error("Invalid event: longitude must be between -180 and 180");
    if (typeof event.video_number !== "string" || !event.video_number.trim()) throw new Error("Invalid event: video_number is required");
    if (typeof event.timestamp !== "string" || !event.timestamp.trim()) throw new Error("Invalid event: timestamp is required");
    if (event.timestamp_seconds !== null && !Number.isFinite(event.timestamp_seconds)) throw new Error("Invalid event: timestamp_seconds must be numeric");
    if (event.frame !== null && (!Number.isInteger(event.frame) || event.frame < 0)) throw new Error("Invalid event: frame must be a non-negative integer");
    if (suppliedRealtime && Number.isNaN(Date.parse(suppliedRealtime))) throw new Error("Invalid event: inrealtime must be a valid timestamp");
    return EventRepo.insert(event);
};
