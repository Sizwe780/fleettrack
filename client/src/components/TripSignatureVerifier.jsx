import React from 'react';

export default function TripSignatureVerifier({ trip }) {
  const { driverSignature, signedAt } = trip;

  return (
    <section className="logsheet-section">
      <h2>✍️ Signature Verifier</h2>
      {driverSignature ? (
        <p style={{ color: '#28a745' }}>
          ✅ Signature present<br />
          Signed At: {new Date(signedAt).toLocaleString()}
        </p>
      ) : (
        <p style={{ color: '#d00', fontWeight: 'bold' }}>❌ Signature missing</p>
      )}
    </section>
  );
}