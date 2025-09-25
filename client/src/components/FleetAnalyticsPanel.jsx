import React from 'react';

export default function FleetAnalyticsPanel({ trips }) {
  const totalTrips = trips.length;
  const breached = trips.filter(t => t.breachDetected).length;
  const avgFuel = (trips.reduce((sum, t) => sum + (t.analysis?.fuelRisk || 0), 0) / totalTrips).toFixed(2);
  const avgFatigue = (trips.reduce((sum, t) => sum + (t.analysis?.fatigueRisk || 0), 0) / totalTrips).toFixed(2);
  const avgDelay = (trips.reduce((sum, t) => sum + (t.analysis?.delayRisk || 0), 0) / totalTrips).toFixed(2);

  const topDrivers = [...trips.reduce((map, t) => {
    const name = t.driverName || 'Unknown';
    map.set(name, (map.get(name) || 0) + (t.analysis?.delayRisk || 0));
    return map;
  }, new Map())]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📊 Fleet Analytics Overview</h2>
      <p><strong>Total Trips:</strong> {totalTrips}</p>
      <p><strong>SLA Breaches:</strong> {breached}</p>
      <p><strong>Avg Fuel Risk:</strong> {avgFuel}</p>
      <p><strong>Avg Fatigue Risk:</strong> {avgFatigue}</p>
      <p><strong>Avg Delay Risk:</strong> {avgDelay}</p>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">🚩 Top Delay Risk Drivers</h3>
        <ul className="list-disc pl-5 text-sm">
          {topDrivers.map(([name, score], i) => (
            <li key={i}>{name} — Delay Risk: {score.toFixed(2)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}