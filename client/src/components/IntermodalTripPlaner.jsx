import React from 'react';

export default function IntermodalTripPlanner({ legs }) {
  return (
    <div className="p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">🔁 Intermodal Trip Plan</h4>
      <ul className="space-y-1">
        {legs.map((leg, i) => (
          <li key={i}>
            {leg.mode} — {leg.origin} → {leg.destination} — ETA: {leg.eta}
          </li>
        ))}
      </ul>
    </div>
  );
}