import React from 'react';

export default function DriverFatigueLedger({ trips }) {
  const ledger = {};

  trips.forEach(t => {
    const name = t.driverName || 'Unknown';
    if (!ledger[name]) ledger[name] = [];
    ledger[name].push(t.analysis?.fatigueRisk || 0);
  });

  const ranked = Object.entries(ledger).map(([name, scores]) => ({
    name,
    avgFatigue: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
    recent: scores.slice(-3).join(', ')
  })).sort((a, b) => b.avgFatigue - a.avgFatigue);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">💤 Driver Fatigue Ledger</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Driver</th><th>Avg Fatigue</th><th>Recent Scores</th></tr></thead>
        <tbody>
          {ranked.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.avgFatigue}</td>
              <td>{d.recent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}