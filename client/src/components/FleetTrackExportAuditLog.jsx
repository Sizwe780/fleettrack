import React from 'react';

export default function FleetTrackExportAuditLog({ trip }) {
  const history = trip?.statusHistory ?? [];

  return (
    <div className="mt-6 border rounded-xl p-4 bg-white shadow-md text-sm">
      <h2 className="text-lg font-bold mb-2">📜 Audit Trail</h2>

      {history.length === 0 ? (
        <p>No status history available.</p>
      ) : (
        <ul className="space-y-1">
          {history.map((entry, i) => {
            const time = new Date(entry.timestamp).toLocaleString();
            return (
              <li key={i}>
                • <strong>{entry.status}</strong> by <code>{entry.actor}</code> at <em>{time}</em>
              </li>
            );
          })}
        </ul>
      )}

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-3">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Audit Log Debug</summary>
        <pre className="overflow-x-auto mt-1">{JSON.stringify(history, null, 2)}</pre>
      </details>
    </div>
  );
}