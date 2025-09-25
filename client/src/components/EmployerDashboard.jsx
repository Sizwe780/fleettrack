import React from 'react';

export default function EmployerDashboard({ missions }) {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded shadow text-sm">
      <h4 className="font-semibold mb-2">📡 Mission Archive</h4>
      <ul className="space-y-2">
        {missions.map((m, i) => (
          <li key={i} className="p-2 bg-white rounded border">
            <p><strong>{m.id}</strong> — {m.commander} — {new Date(m.launchTime).toLocaleDateString()}</p>
            <p>Status: {m.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}