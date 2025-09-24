import React from 'react';

export default function AuditTrail({ logs }) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Audit Trail</h3>
      <ul className="text-sm text-gray-600 space-y-1">
        {logs.map((log, i) => (
          <li key={i}>
            <strong>{log.timestamp}</strong>: {log.action} — {log.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}