const type = await EventRepo.findTypeByCode(event.event_type.trim().toLowerCase());
if (!type) throw new Error("Invalid event: unknown event_type");

const saved = await EventRepo.insert({
    ...event,
    event_type_id: type.id,
    raw_data: [input.event_type, input.street_location, input.latitude, input.longitude].join(","),
});
await TicketService.createFromEvent(saved, type);
return saved;