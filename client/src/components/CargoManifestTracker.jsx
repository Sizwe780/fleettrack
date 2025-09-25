import React from 'react';

export default function CargoManifestTracker({ manifest }) {
  return (
    <div className="p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">📦 Cargo Manifest</h4>
      <ul className="space-y-1">
        {manifest.map((c, i) => (
          <li key={i}>
            🚚 {c.type} — {c.weight}kg — Condition: {c.condition} — Delivered: {c.delivered ? '✅' : '❌'}
          </li>
        ))}
      </ul>
    </div>
  );
}