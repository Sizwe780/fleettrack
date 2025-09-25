import React from 'react';

export default function TripExportCompleteness({ trip }) {
  const fields = [
    { label: "Trip ID", value: trip.tripId },
    { label: "Origin", value: trip.origin },
    { label: "Destination", value: trip.destination },
    { label: "Driver Signature", value: trip.driverSignature },
    { label: "Audit Hash", value: trip.audit_hash },
    { label: "Exported At", value: trip.exportedAt }
  ];

  const missing = fields.filter(f => !f.value);
  const score = Math.max(0, 100 - missing.length * 15);

  return (
    <section className="logsheet-section">
      <h2>📋 Export Completeness</h2>
      <p><strong>Score:</strong> {score}%</p>
      {missing.length > 0 ? (
        <ul className="list-disc pl-5 text-sm">
          {missing.map((f, i) => <li key={i}>❌ Missing: {f.label}</li>)}
        </ul>
      ) : (
        <p>✅ All required fields present</p>
      )}
    </section>
  );
}