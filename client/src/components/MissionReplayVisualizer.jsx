import React from 'react';

export default function MissionReplayVisualizer({ timeline }) {
  return (
    <div className="mt-6 p-4 bg-white rounded shadow text-xs">
      <h4 className="font-semibold mb-2">🔁 Mission Replay</h4>
      <ul className="space-y-1">
        {timeline.map((t, i) => (
          <li key={i}>
            {t.marker && <strong>{t.marker} — </strong>}
            {new Date(t.timestamp).toLocaleTimeString()} — {t.velocity}, {t.fuel}, Status: {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}