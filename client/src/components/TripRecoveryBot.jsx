import React from 'react';

export default function TripRecoveryBot({ trip }) {
  const patches = [];

  if (!trip.duration && trip.startTime && trip.endTime) {
    const start = new Date(trip.startTime).getTime();
    const end = new Date(trip.endTime).getTime();
    const duration = ((end - start) / 1000 / 60 / 60).toFixed(2);
    patches.push({ field: "duration", value: duration });
  }

  if (!trip.routeSummary && trip.origin && trip.destination) {
    patches.push({
      field: "routeSummary",
      value: `Auto-generated route from ${trip.origin} to ${trip.destination}`
    });
  }

  if (!trip.stops || trip.stops.length === 0) {
    patches.push({
      field: "stops",
      value: [{ location: trip.origin, timestamp: trip.startTime }]
    });
  }

  if (!trip.driverName && trip.assignedDriver) {
    patches.push({ field: "driverName", value: trip.assignedDriver });
  }

  return (
    <section className="logsheet-section">
      <h2>Trip Recovery Bot</h2>
      {patches.length > 0 ? (
        <ul>
          {patches.map((p, i) => (
            <li key={i} style={{ color: '#28a745' }}>
              🛠️ <strong>{p.field}</strong> → {JSON.stringify(p.value)}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'green', fontWeight: 'bold' }}>✅ No recovery needed — trip is complete</p>
      )}
    </section>
  );
}