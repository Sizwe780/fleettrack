import React from 'react';

export default function FleetAuditCompleteness({ trips }) {
  const scores = trips.map(t => {
    let score = 100;
    if (!t.driverSignature) score -= 20;
    if (!t.audit_hash) score -= 15;
    if (!t.origin || !t.destination || !t.duration) score -= 10;
    if (t.metadataFlags?.length > 0) score -= t.metadataFlags.length * 5;
    return {
      tripId: t.tripId,
      score: Math.max(score, 0)
    };
  });

  const sorted = scores.sort((a, b) => a.score - b.score);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📋 Fleet Audit Completeness</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Trip ID</th><th>Audit Score</th></tr></thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={i}>
              <td>{t.tripId}</td>
              <td style={{ color: t.score < 60 ? '#d00' : '#28a745' }}>{t.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}