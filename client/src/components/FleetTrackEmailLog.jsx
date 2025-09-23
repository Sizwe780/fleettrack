import React from 'react';

export default function FleetTrackEmailLog({ log = [] }) {
  if (!Array.isArray(log) || log.length === 0) {
    return <p>No email deliveries recorded yet.</p>;
  }

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md text-sm space-y-6">
      <h2 className="text-xl font-bold">📫 FleetTrack Email Delivery Log</h2>

      <ul className="space-y-4">
        {log.map((entry, i) => (
          <li key={i} className="border-b pb-2">
            <p><strong>To:</strong> {entry.recipient}</p>
            <p><strong>Subject:</strong> {entry.subject}</p>
            <p><strong>Status:</strong> {entry.status}</p>
            <p><strong>Timestamp:</strong> {new Date(entry.timestamp).toLocaleString()}</p>
          </li>
        ))}
      </ul>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Email Log Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(log, null, 2)}</pre>
      </details>
    </div>
  );
}