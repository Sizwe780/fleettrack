import React from 'react';

export default function FleetOpsTimeline({ trips }) {
  const events = [];

  trips.forEach((trip) => {
    if (trip.dispatchStatus) {
      events.push({
        tripId: trip.tripId,
        label: `Dispatch: ${trip.dispatchStatus}`,
        time: trip.dispatchUpdatedAt || trip.startTime,
        type: 'dispatch'
      });
    }

    if (trip.breachDetected) {
      events.push({
        tripId: trip.tripId,
        label: 'SLA Breach',
        time: trip.breachTime,
        type: 'breach'
      });
    }

    if (trip.recoveryTime) {
      events.push({
        tripId: trip.tripId,
        label: 'Recovery',
        time: trip.recoveryTime,
        type: 'recovery'
      });
    }

    if (trip.exportedAt) {
      events.push({
        tripId: trip.tripId,
        label: 'Exported',
        time: trip.exportedAt,
        type: 'export'
      });
    }
  });

  const sorted = events.sort((a, b) => new Date(a.time) - new Date(b.time));

  const colorMap = {
    dispatch: '#36a2eb',
    breach: '#d00',
    recovery: '#28a745',
    export: '#ff9f40'
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📈 Fleet Ops Timeline</h2>
      <ul className="list-disc pl-5 text-sm">
        {sorted.map((e, i) => (
          <li key={i} style={{ color: colorMap[e.type] }}>
            <strong>{e.tripId}</strong> — {e.label} at {new Date(e.time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}