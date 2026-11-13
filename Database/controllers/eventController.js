const ZoneModel = require('../models/zoneModel');
const EventModel = require('../models/eventModel');
const TicketModel = require('../models/ticketModel');

exports.postEvent = (req, res) => {
  try {
    const b = req.body || {};
    const zone = ZoneModel.findByCode(String(b.event_type || '').trim().toLowerCase());
    if (!zone) return res.status(400).json({ message: 'Invalid event: unknown event_type' });
    if (!b.street_location) return res.status(400).json({ message: 'Invalid event: street_location is required' });

    const event = EventModel.insert({
      zone_id: zone.id,
      raw_data: [b.event_type, b.street_location, b.latitude, b.longitude].join(','),
      street_loc: b.street_location,
      latitude: b.latitude ?? null,
      longitude: b.longitude ?? null,
      video_number: b.video_number ?? null,
      timestamp: b.timestamp ?? null,
      timestamp_seconds: b.timestamp_seconds ?? null,
      frame: b.frame ?? null,
    });

    const ticket = zone.fine == null
      ? null   // collision: logged, no ticket
      : TicketModel.create({ event_id: event.id, zone, street_loc: event.street_loc });

    res.status(201).json({ event, ticket });
  } catch (err) {
    console.error('POST event error:', err.message);
    res.status(500).json({ message: 'Could not save event' });
  }
};