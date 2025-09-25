import React from 'react';

export default function FleetBillingDashboard({ clients }) {
  return (
    <div className="p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">💳 Billing Overview</h4>
      <ul className="space-y-2">
        {clients.map((c, i) => (
          <li key={i} className="border p-2 rounded">
            <p><strong>{c.name}</strong> — Trips: {c.tripCount}</p>
            <p>Monthly Bill: R{c.monthlyTotal}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}