import React from 'react';

export default function TripViewerAuditTrail({ logs }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">📜 Audit Trail</h3>
      <ul className="space-y-2 text-sm">
        {logs.map((log, i) => (
          <li key={i} className="border p-2 rounded-md">
            <div><strong>Action:</strong> {log.action}</div>
            <div><strong>Actor:</strong> {log.actor}</div>
            <div><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</div>
            <div><strong>Reason:</strong> {log.reason}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}