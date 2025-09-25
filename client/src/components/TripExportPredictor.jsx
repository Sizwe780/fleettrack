import React from 'react';

export default function TripExportPredictor({ trip }) {
  const issues = [];
  if (!trip.driverSignature) issues.push("Missing signature");
  if (!trip.audit_hash) issues.push("Missing audit hash");
  if (!trip.origin || !trip.destination || !trip.duration) issues.push("Incomplete metadata");
  if (trip.breachDetected) issues.push("SLA breach detected");

  const riskScore = Math.min(100, issues.length * 25);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📉 Export Failure Predictor</h2>
      <p><strong>Risk Score:</strong> {riskScore}%</p>
      {issues.length > 0 ? (
        <ul className="list-disc pl-5 text-sm">
          {issues.map((i, idx) => <li key={idx}>❌ {i}</li>)}
        </ul>
      ) : (
        <p>✅ Trip is likely to pass export validation.</p>
      )}
    </div>
  );
}