import React from 'react';

export default function FlightReplayVisualizer({ timeline }) {
  return (
    <div className="mt-6 p-4 bg-white rounded shadow text-xs">
      <h4 className="font-semibold mb-2">🔁 Flight Replay</h4>
      <ul className="space-y-1">
        {timeline.map((t, i) => (
          <li key={i}>
            {t.marker && <strong>{t.marker} — </strong>}
            {new Date(t.timestamp).toLocaleTimeString()} — {t.altitude} ft, {t.speed} km/h, Fuel: {t.fuel}, Status: {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}