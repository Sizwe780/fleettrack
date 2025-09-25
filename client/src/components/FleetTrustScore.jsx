import React from 'react';

export default function FleetTrustScore({ trips }) {
  const scores = trips.map((trip) => {
    let score = 100;

    if (!trip.driverSignature) score -= 20;
    if (!trip.audit_hash) score -= 15;
    if (trip.breachDetected) score -= 25;
    if (!trip.versionHistory || trip.versionHistory.length === 0) score -= 10;
    if (trip.metadataFlags?.length > 0) score -= trip.metadataFlags.length * 5;

    return {
      tripId: trip.tripId,
      vehicleId: trip.vehicleId,
      driverName: trip.driverName,
      score: Math.max(score, 0)
    };
  });

  const sorted = scores.sort((a, b) => a.score - b.score);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🛡️ Fleet Trust Score</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Trip ID</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Trust Score</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={i}>
              <td>{t.tripId}</td>
              <td>{t.vehicleId}</td>
              <td>{t.driverName}</td>
              <td style={{ color: t.score < 60 ? '#d00' : '#28a745' }}>{t.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}