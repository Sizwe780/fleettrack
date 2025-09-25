import React from 'react';

export default function FleetSLACompliancePanel({ trips }) {
  const stats = {};

  trips.forEach(t => {
    const key = `${t.vehicleId || 'Unknown'}-${t.driverName || 'Unknown'}`;
    if (!stats[key]) stats[key] = { total: 0, breaches: 0 };
    stats[key].total += 1;
    if (t.breachDetected) stats[key].breaches += 1;
  });

  const ranked = Object.entries(stats).map(([key, s]) => {
    const [vehicleId, driverName] = key.split('-');
    const rate = ((s.breaches / s.total) * 100).toFixed(1);
    return { vehicleId, driverName, total: s.total, breaches: s.breaches, rate };
  }).sort((a, b) => b.rate - a.rate);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📊 SLA Compliance Panel</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Vehicle</th><th>Driver</th><th>Trips</th><th>Breaches</th><th>Breach Rate</th></tr></thead>
        <tbody>
          {ranked.map((r, i) => (
            <tr key={i}>
              <td>{r.vehicleId}</td>
              <td>{r.driverName}</td>
              <td>{r.total}</td>
              <td>{r.breaches}</td>
              <td style={{ color: r.rate > 30 ? '#d00' : '#28a745' }}>{r.rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}