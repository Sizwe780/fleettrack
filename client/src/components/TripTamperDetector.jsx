import React from 'react';

export default function TripTamperDetector({ trip }) {
  const issues = [];

  if (!trip.audit_hash) issues.push("Missing audit hash");
  if (trip.computedHash && trip.audit_hash && trip.computedHash !== trip.audit_hash) {
    issues.push("Hash mismatch — possible tampering");
  }
  if (!trip.driverSignature) issues.push("Missing signature");
  if (trip.versionHistory?.length > 5) issues.push("Excessive version edits");

  return (
    <section className="logsheet-section">
      <h2>🔍 Trip Tamper Detector</h2>
      {issues.length > 0 ? (
        <ul className="list-disc pl-5 text-sm">
          {issues.map((i, idx) => <li key={idx}>❌ {i}</li>)}
        </ul>
      ) : (
        <p style={{ color: 'green', fontWeight: 'bold' }}>✅ No tampering detected</p>
      )}
    </section>
  );
}