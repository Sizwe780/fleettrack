import React from 'react';

const AuditTrailViewer = ({ auditTrail }) => {
  if (!Array.isArray(auditTrail) || auditTrail.length === 0) {
    return <p className="text-sm text-gray-500">No audit entries available.</p>;
  }

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold mb-2">Audit Trail</h4>
      <ul className="space-y-2">
        {auditTrail.map((entry, i) => (
          <li key={i} className="text-xs bg-gray-100 p-2 rounded-md">
            <span className="font-bold">{entry.action}</span> by <span className="text-blue-700">{entry.actor}</span>  
            <br />
            <span className="text-gray-600">{new Date(entry.timestamp).toLocaleString()}</span>
            <br />
            <span className="text-gray-700 italic">{entry.reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuditTrailViewer;