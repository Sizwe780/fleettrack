import React from 'react';

const AuditTrailViewer = ({ trip }) => {
  const incidents = trip.incidents ?? [];
  const statusHistory = trip.statusHistory ?? [];

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">📜 Audit Trail</h2>
      <ul className="text-sm space-y-2">
        {statusHistory.map((s, i) => (
          <li key={i}>🔄 {s.status} at {s.timestamp}</li>
        ))}
        {incidents.map((inc, i) => (
          <li key={i}>🚨 {inc.type} ({inc.severity}) at {inc.location}</li>
        ))}
      </ul>
    </div>
  );
};

export default AuditTrailViewer;