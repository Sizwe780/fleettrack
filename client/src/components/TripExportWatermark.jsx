import React from 'react';

export default function TripExportWatermark({ trip }) {
  const {
    tripId, audit_hash, exportedAt, driverSignature, signedAt
  } = trip;

  return (
    <section className="logsheet-section">
      <h2>🖨️ Export Watermark</h2>
      <p><strong>Trip ID:</strong> {tripId}</p>
      <p><strong>Audit Hash:</strong> {audit_hash}</p>
      <p><strong>Exported At:</strong> {new Date(exportedAt).toLocaleString()}</p>
      <p><strong>Signed At:</strong> {signedAt ? new Date(signedAt).toLocaleString() : '—'}</p>
      <p><strong>Signature:</strong> {driverSignature ? '✅ Present' : '❌ Missing'}</p>
    </section>
  );
}