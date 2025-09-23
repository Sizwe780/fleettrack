import React from 'react';

export default function FleetTrackExportHistory({ history = [] }) {
  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md text-sm">
      <h2 className="text-xl font-bold mb-4">📜 Export History</h2>

      {history.length === 0 ? (
        <p>No export actions recorded yet.</p>
      ) : (
        <ul className="space-y-3">
          {history.map((entry, i) => {
            const time = new Date(entry.timestamp).toLocaleString();
            return (
              <li key={i} className="border-b pb-2">
                <p><strong>{entry.format.toUpperCase()}</strong> export of <code>{entry.tripId}</code></p>
                <p>🕒 {time}</p>
                <p>👤 Exported by: {entry.actor}</p>
                <p>📁 Filename: {entry.filename}</p>
              </li>
            );
          })}
        </ul>
      )}

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Export History Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(history, null, 2)}</pre>
      </details>
    </div>
  );
}