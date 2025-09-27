// src/pages/FleetOverview.jsx
import React from 'react';

export default function FleetOverview({ fleets }) {
  return (
    <div className="fleet-overview">
      <h2>Fleet Status</h2>
      <ul>
        {fleets.map((f, i) => (
          <li key={i}>
            {f.name} – {f.status} – {f.region}
          </li>
        ))}
      </ul>
    </div>
  );
}