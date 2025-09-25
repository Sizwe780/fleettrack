import React from 'react';

export default function DroneMaritimeSyncPanel({ missions }) {
  return (
    <div className="p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">🚁 Drone & Maritime Sync</h4>
      <ul className="space-y-1">
        {missions.map((m, i) => (
          <li key={i}>
            {m.mode} — {m.origin} → {m.destination} — Altitude: {m.altitude || 'N/A'} — ETA: {m.eta}
          </li>
        ))}
      </ul>
    </div>
  );
}