import React from 'react';

export default function TripAuditExport({ auditTrail }) {
  const handleExport = () => {
    const lines = auditTrail.map(log => `${log.timestamp} - ${log.action}: ${log.reason}`);
    console.log('Audit Trail Export:', lines);
    alert('Audit trail exported (simulated)');
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
      >
        📁 Export Audit Trail
      </button>
    </div>
  );
}