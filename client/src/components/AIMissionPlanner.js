import React from 'react';

export default function ColdChainTracker({ cargo }) {
  return (
    <div className="p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">❄️ Cold Chain Monitor</h4>
      <ul className="space-y-1">
        {cargo.map((c, i) => (
          <li key={i}>
            🧊 {c.name} — Temp: {c.temp}°C — Humidity: {c.humidity}% — Status: {c.status}
          </li>
        ))}
      </ul>
    </div>
  );
}