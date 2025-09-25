import React from 'react';
import sha256 from 'js-sha256';

export default function TripComplianceOverlay({ trip }) {
  const {
    tripId, origin, destination, stops = [],
    duration, driverName, audit_hash, exportedAt
  } = trip;

  const generateHash = () => {
    const payload = JSON.stringify({
      tripId, origin, destination, stops, duration, driverName
    });
    return sha256(payload);
  };

  const computedHash = generateHash();
  const isValid = computedHash === audit_hash;

  return (
    <section className="logsheet-section">
      <h2>Compliance Verification</h2>
      <p><strong>Audit Hash:</strong> {audit_hash}</p>
      <p><strong>Computed Hash:</strong> {computedHash}</p>
      <p><strong>Exported At:</strong> {new Date(exportedAt).toLocaleString()}</p>

      {isValid ? (
        <p style={{ color: 'green', fontWeight: 'bold' }}>✅ Logsheet integrity verified</p>
      ) : (
        <p style={{ color: 'red', fontWeight: 'bold' }}>❌ Hash mismatch — possible tampering or missing fields</p>
      )}
    </section>
  );
}