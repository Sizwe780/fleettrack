import React from 'react';

export default function MultiFleetCoordinator({ fleets }) {
  return (
    <div className="p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">🚚 Multi-Fleet Coordination</h4>
      <ul className="space-y-1">
        {fleets.map((f, i) => (
          <li key={i}>
            🏢 {f.employer} — Vehicles: {f.vehicles.length} — Region: {f.region}
          </li>
        ))}
      </ul>
    </div>
  );
}