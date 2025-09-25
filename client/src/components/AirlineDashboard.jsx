import React from 'react';

export default function AirlineDashboard({ flights }) {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded shadow text-sm">
      <h4 className="font-semibold mb-2">📡 Airline Fleet Overview</h4>
      <ul className="space-y-2">
        {flights.map((f, i) => (
          <li key={i} className="p-2 bg-white rounded border">
            <p><strong>{f.id}</strong> — {f.pilot} — {new Date(f.departureTime).toLocaleDateString()}</p>
            <p>Status: {f.status} — Compliance: {f.complianceScore}%</p>
          </li>
        ))}
      </ul>
    </div>
  );
}