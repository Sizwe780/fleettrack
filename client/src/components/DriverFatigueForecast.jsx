import React from 'react';

export default function DriverFatigueForecast({ trips }) {
  const forecast = {};

  trips.forEach(t => {
    const name = t.driverName || 'Unknown';
    if (!forecast[name]) forecast[name] = [];
    forecast[name].push(t.analysis?.fatigueRisk || 0);
  });

  const ranked = Object.entries(forecast).map(([name, scores]) => {
    const recent = scores.slice(-3);
    const avg = (recent.reduce((a, b) => a + b, 0) / recent.length).toFixed(2);
    const nextRisk = Math.min(10, (parseFloat(avg) + 1.5).toFixed(1));
    return { name, avg, nextRisk };
  }).sort((a, b) => b.nextRisk - a.nextRisk);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🔮 Fatigue Forecast</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Driver</th><th>Avg Fatigue</th><th>Forecast</th></tr></thead>
        <tbody>
          {ranked.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.avg}</td>
              <td style={{ color: d.nextRisk > 7 ? '#d00' : '#28a745' }}>{d.nextRisk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}