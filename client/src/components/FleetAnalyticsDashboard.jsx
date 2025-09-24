import React from 'react';

export default function FleetAnalyticsDashboard({ trips }) {
  const totalTrips = trips.length;
  const totalProfit = trips.reduce((sum, t) => sum + (t.analysis?.profitability?.revenue ?? 0), 0);
  const avgProfit = Math.round(totalProfit / (totalTrips || 1));

  const avgFuelUsed = Math.round(
    trips.reduce((sum, t) => sum + (t.analysis?.ifta?.fuelUsed ?? 0), 0) / (totalTrips || 1)
  );

  const avgHealthScore = Math.round(
    trips.reduce((sum, t) => sum + (t.analysis?.healthScore ?? t.healthScore ?? 0), 0) / (totalTrips || 1)
  );

  const slaBreaches = trips.filter(t => t.slaBreached).length;
  const flaggedTrips = trips.filter(t => t.status === 'critical').length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">📊 Fleet Analytics Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-green-50 p-3 rounded">
          <p className="font-semibold">Total Trips</p>
          <p>{totalTrips}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="font-semibold">Avg Profit</p>
          <p>R{avgProfit}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <p className="font-semibold">Avg Fuel Used</p>
          <p>{avgFuelUsed} L</p>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <p className="font-semibold">Avg Health Score</p>
          <p>{avgHealthScore}/100</p>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <p className="font-semibold">SLA Breaches</p>
          <p>{slaBreaches}</p>
        </div>
        <div className="bg-pink-50 p-3 rounded">
          <p className="font-semibold">Flagged Trips</p>
          <p>{flaggedTrips}</p>
        </div>
      </div>
    </div>
  );
}