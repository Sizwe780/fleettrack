import React from 'react';

export default function TripRecoveryExplainer({ trip }) {
  const { breachTime, recoveryTime, exportedAt } = trip;
  const narrative = [];

  if (breachTime) {
    narrative.push(`Trip breached SLA at ${new Date(breachTime).toLocaleString()}.`);
  }
  if (recoveryTime) {
    narrative.push(`Recovery actions completed by ${new Date(recoveryTime).toLocaleString()}.`);
  }
  if (exportedAt) {
    narrative.push(`Trip was successfully exported at ${new Date(exportedAt).toLocaleString()}.`);
  }

  return (
    <section className="logsheet-section">
      <h2>🛠️ Trip Recovery Explainer</h2>
      <p className="text-sm leading-relaxed">{narrative.join(' ') || '✅ No recovery sequence recorded for this trip.'}</p>
    </section>
  );
}