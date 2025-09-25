const Trip = require('../models/Trip');
const crypto = require('crypto');

exports.createTrip = async (req, res) => {
  try {
    const {
      userId,
      driver_name,
      date,
      current_location,
      cycle_used,
      departure_time,
      end_time,
      origin,
      destination,
      stops,
      remarks,
      routeData,
      status,
      exportedBy,
    } = req.body;

    const safeDeparture = departure_time || new Date().toISOString();
    const safeEnd = end_time || new Date().toISOString();
    const duration = calculateDuration(safeDeparture, safeEnd);

    const enrichedRouteData = routeData?.summary
      ? routeData
      : {
          summary: 'Route summary not provided',
          distance: '—',
          estimatedTime: '—',
        };

    const tripPayload = {
      userId,
      driver_name: driver_name || 'Unknown Driver',
      date: date || new Date().toISOString().split('T')[0],
      current_location: current_location || '—',
      cycle_used: cycle_used || '—',
      departure_time: safeDeparture,
      end_time: safeEnd,
      duration,
      origin: origin || { location: '—', latitude: null, longitude: null },
      destination: destination || { location: '—', latitude: null, longitude: null },
      stops: stops || [],
      remarks: remarks || 'No remarks recorded.',
      routeData: enrichedRouteData,
      status: status || 'pending',
      exportedAt: new Date(),
      exportedBy: exportedBy || 'system',
    };

    const audit_hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(tripPayload))
      .digest('hex');

    const trip = new Trip({ ...tripPayload, audit_hash });
    await trip.save();

    res.status(201).json(trip);
  } catch (err) {
    console.error('Trip creation failed:', err);
    res.status(500).json({ error: 'Trip creation failed' });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const transformedTrip = {
      tripId: trip._id,
      origin: trip.origin?.location || '—',
      destination: trip.destination?.location || '—',
      driverName: trip.driver_name || '—',
      vehicleId: trip.cycle_used || '—',
      startTime: trip.departure_time || '—',
      endTime: trip.end_time || '—',
      duration: trip.duration || null,
      routeSummary: trip.routeData?.summary || '—',
      stops: trip.stops || [],
      remarks: trip.stops?.map(s => s.remark) || [],
      status: trip.status || '—',
      exportedAt: trip.exportedAt || null,
      audit_hash: trip.audit_hash || null,
    };

    res.json(transformedTrip);
  } catch (err) {
    console.error('Failed to fetch trip:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function calculateDuration(start, end) {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffMs = endTime - startTime;
  return isNaN(diffMs) ? null : parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
}