import React from 'react';

export default function FleetRecoveryTimeline({ trips }) {
  const events = [];

  trips.forEach(t => {
    if (t.breachDetected) events.push({ tripId: t.tripId, label: 'Breach', time: t.breachTime, color: '#d00' });
    if (t.recoveryTime) events.push({ tripId: t.tripId, label: 'Recovery', time: t.recoveryTime, color: '#28a745' });
    if (t.exportedAt) events.push({ tripId: t.tripId, label: 'Exported', time: t.exportedAt, color: '#36a2eb' });
  });

  const sorted = events.sort((a, b) => new Date(a.time) - new Date(b.time));

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📈 Fleet Recovery Timeline</h2>
      <ul className="list-disc pl-5 text-sm">
        {sorted.map((e, i) => (
          <li key={i} style={{ color: e.color }}>
            <strong>{e.tripId}</strong> — {e.label} at {new Date(e.time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}