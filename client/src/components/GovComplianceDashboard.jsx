import React from 'react';

export default function GovComplianceDashboard({ audits }) {
  return (
    <div className="p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">📋 Government Compliance Overview</h4>
      <ul className="space-y-2">
        {audits.map((a, i) => (
          <li key={i} className="border p-2 rounded">
            <p><strong>{a.tripId}</strong> — SLA: {a.slaScore}% — Exported: {new Date(a.exportedAt).toLocaleDateString()}</p>
            <p>Status: {a.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}