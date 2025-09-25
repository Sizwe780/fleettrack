import React from 'react';

export default function TripExportFailureNarrative({ trip }) {
  const issues = [];

  if (!trip.driverSignature) issues.push("Missing driver signature");
  if (!trip.audit_hash) issues.push("Missing audit hash");
  if (trip.computedHash && trip.audit_hash && trip.computedHash !== trip.audit_hash) {
    issues.push("Audit hash mismatch");
  }
  if (trip.metadataFlags?.length > 0) {
    issues.push(`${trip.metadataFlags.length} metadata issues`);
  }

  return (
    <section className="logsheet-section">
      <h2>📉 Export Failure Narrative</h2>
      {issues.length > 0 ? (
        <ul className="list-disc pl-5 text-sm">
          {issues.map((i, idx) => <li key={idx}>❌ {i}</li>)}
        </ul>
      ) : (
        <p>✅ No export failure detected</p>
      )}
    </section>
  );
}