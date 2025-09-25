import React from 'react';

export default function DriverRecoveryScore({ trips }) {
  const stats = {};

  trips.forEach(t => {
    const name = t.driverName || 'Unknown';
    if (!stats[name]) stats[name] = { breaches: 0, recovered: 0 };
    if (t.breachDetected) {
      stats[name].breaches += 1;
      if (t.analysis?.delayRisk < 5 && t.analysis?.fatigueRisk < 5) {
        stats[name].recovered += 1;
      }
    }
  });

  const ranked = Object.entries(stats).map(([name, s]) => ({
    name,
    breaches: s.breaches,
    recovered: s.recovered,
    score: s.breaches > 0 ? ((s.recovered / s.breaches) * 100).toFixed(1) : '—'
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🛠️ Driver Recovery Score</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Driver</th><th>Breaches</th><th>Recovered</th><th>Score</th></tr></thead>
        <tbody>
          {ranked.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.breaches}</td>
              <td>{d.recovered}</td>
              <td style={{ color: d.score < 50 ? '#d00' : '#28a745' }}>{d.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}