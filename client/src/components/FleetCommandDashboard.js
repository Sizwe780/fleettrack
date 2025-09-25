import React from 'react';

export default function FleetCommandDashboard({ fleet }) {
  return (
    <div className="p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">📡 Fleet Command Overview</h4>
      <ul className="space-y-1">
        {fleet.map((v, i) => (
          <li key={i}>
            🚚 {v.id} — Status: {v.status} — Location: {v.location} — Mission: {v.mission || 'Idle'}
          </li>
        ))}
      </ul>
    </div>
  );
}