import React from 'react';

export default function DriverTrustLedger({ trips }) {
  const ledger = {};

  trips.forEach(trip => {
    const name = trip.driverName || 'Unknown';
    if (!ledger[name]) {
      ledger[name] = {
        total: 0,
        signed: 0,
        hashMatch: 0,
        breaches: 0
      };
    }

    ledger[name].total += 1;
    if (trip.driverSignature) ledger[name].signed += 1;
    if (trip.audit_hash && trip.computedHash === trip.audit_hash) ledger[name].hashMatch += 1;
    if (trip.breachDetected) ledger[name].breaches += 1;
  });

  const ranked = Object.entries(ledger).map(([name, stats]) => {
    const trustScore = Math.round(
      ((stats.signed + stats.hashMatch) / (stats.total * 2)) * 100 - stats.breaches * 5
    );
    return {
      name,
      total: stats.total,
      signed: stats.signed,
      hashMatch: stats.hashMatch,
      breaches: stats.breaches,
      trustScore: Math.max(trustScore, 0)
    };
  }).sort((a, b) => b.trustScore - a.trustScore);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🔐 Driver Trust Ledger</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Driver</th>
            <th>Signed</th>
            <th>Hash Match</th>
            <th>Breaches</th>
            <th>Trust Score</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.signed}/{d.total}</td>
              <td>{d.hashMatch}/{d.total}</td>
              <td>{d.breaches}</td>
              <td style={{ color: d.trustScore < 60 ? '#d00' : '#28a745' }}>{d.trustScore}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}