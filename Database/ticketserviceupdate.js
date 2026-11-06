exports.createFromEvent = async (event, type) => {
  if (type.fine == null) return null;   // e.g. collision
  await TicketRepo.insert({
    event_id: event.id,
    violation: type.label,
    street_loc: event.street_loc,
    price: type.fine,
  });
};