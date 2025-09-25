import React from 'react';
import sha256 from 'js-sha256';

export default function TripExportAudit({ trip }) {
  const {
    tripId, origin, destination, stops = [],
    duration, driverName, audit_hash, driverSignature, signedAt, exportedAt
  } = trip;

  const generateHash = () => {
    const payload = JSON.stringify({
      tripId, origin, destination, stops, duration, driverName
    });
    return sha256(payload);
  };

  const computedHash = generateHash();
  const isValid = computedHash === audit_hash;
  const isSigned = !!driverSignature;

  return (
    <section className="logsheet-section">
      <h2>📜 Trip Export Audit</h2>
      <p><strong>Trip ID:</strong> {tripId}</p>
      <p><strong>Exported At:</strong> {new Date(exportedAt).toLocaleString()}</p>
      <p><strong>Signed At:</strong> {signedAt ? new Date(signedAt).toLocaleString() : '—'}</p>
      <p><strong>Audit Hash:</strong> {audit_hash}</p>
      <p><strong>Computed Hash:</strong> {computedHash}</p>

      {isValid && isSigned ? (
        <p style={{ color: 'green', fontWeight: 'bold' }}>✅ Export integrity verified — logsheet is signed and hash matches</p>
      ) : (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          ❌ Export failed validation — {isSigned ? '' : 'missing signature; '} {isValid ? '' : 'hash mismatch detected'}
        </p>
      )}
    </section>
  );
}