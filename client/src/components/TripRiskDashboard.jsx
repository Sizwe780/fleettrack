import React from 'react';

export default function TripRiskDashboard({ trips }) {
  const flagged = trips.filter(t => t.status === 'critical');
  const avgFuel = (trips.reduce((sum, t) => sum + (t.analysis?.fuelRisk || 0), 0) / trips.length).toFixed(2);
  const avgFatigue = (trips.reduce((sum, t) => sum + (t.analysis?.fatigueRisk || 0), 0) / trips.length).toFixed(2);
  const avgDelay = (trips.reduce((sum, t) => sum + (t.analysis?.delayRisk || 0), 0) / trips.length).toFixed(2);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🧠 Fleet Risk Dashboard</h2>
      <p><strong>Flagged Trips:</strong> {flagged.length}</p>
      <p><strong>Avg Fuel Risk:</strong> {avgFuel}</p>
      <p><strong>Avg Fatigue Risk:</strong> {avgFatigue}</p>
      <p><strong>Avg Delay Risk:</strong> {avgDelay}</p>
    </div>
  );
}