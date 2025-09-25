import React from 'react';

export default function FleetResilienceScore({ trips }) {
  const assetStats = {};

  trips.forEach(trip => {
    const key = `${trip.vehicleId || 'Unknown'}-${trip.driverName || 'Unknown'}`;
    if (!assetStats[key]) {
      assetStats[key] = {
        total: 0,
        breaches: 0,
        recovered: 0
      };
    }

    assetStats[key].total += 1;
    if (trip.breachDetected) {
      assetStats[key].breaches += 1;
      if (trip.analysis?.delayRisk < 5 && trip.analysis?.fatigueRisk < 5) {
        assetStats[key].recovered += 1;
      }
    }
  });

  const scores = Object.entries(assetStats).map(([key, stats]) => {
    const [vehicleId, driverName] = key.split('-');
    const recoveryRate = stats.breaches > 0
      ? ((stats.recovered / stats.breaches) * 100).toFixed(1)
      : '—';
    return {
      vehicleId,
      driverName,
      totalTrips: stats.total,
      breaches: stats.breaches,
      recoveryRate
    };
  }).sort((a, b) => b.recoveryRate - a.recoveryRate);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🛠️ Fleet Resilience Score</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Total Trips</th>
            <th>SLA Breaches</th>
            <th>Recovery Rate</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr key={i}>
              <td>{s.vehicleId}</td>
              <td>{s.driverName}</td>
              <td>{s.totalTrips}</td>
              <td>{s.breaches}</td>
              <td style={{ color: s.recoveryRate < 50 ? '#d00' : '#28a745' }}>{s.recoveryRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}