import React from 'react';

export default function IncidentTracePanel({ incidents }) {
  return (
    <div className="p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">🛡️ Incident Timeline</h4>
      <ul className="space-y-1">
        {incidents.map((e, i) => (
          <li key={i}>
            {e.timestamp} — {e.type} — Severity: {e.severity} — Resolution: {e.resolution}
          </li>
        ))}
      </ul>
    </div>
  );
}