import React from 'react';

export default function TripRiskDashboard({ trips }) {
  const flagged = trips.filter(t => t.status === 'critical');
  const avgFuel = (trips.reduce((sum, t) => sum + (t.analysis?.fuelRisk || 0), 0) / trips.length).toFixed(2);
  const avgFatigue = (trips.reduce((sum, t) => sum + (t.analysis?.fatigueRisk || 0), 0) / trips.length).toFixed(2);
  const avgDelay = (trips.reduce((sum, t) => sum + (t.analysis?.delayRisk || 0), 0) / trips.length).toFixed(2);

  const getSeverity = (value) => {
    const v = parseFloat(value);
    if (v >= 7) return 'High';
    if (v >= 4) return 'Moderate';
    return 'Low';
  };

  const renderBar = (value) => (
    <div className="w-full bg-gray-200 rounded h-2 mt-1 mb-2">
      <div
        className="bg-red-500 h-2 rounded"
        style={{ width: `${Math.min(value * 10, 100)}%` }}
      />
    </div>
  );

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🧠 Fleet Risk Dashboard</h2>

      <p><strong>Flagged Trips:</strong> {flagged.length}</p>

      <div className="mt-4">
        <p><strong>Avg Fuel Risk:</strong> {avgFuel} ({getSeverity(avgFuel)})</p>
        {renderBar(avgFuel)}
        <p><strong>Avg Fatigue Risk:</strong> {avgFatigue} ({getSeverity(avgFatigue)})</p>
        {renderBar(avgFatigue)}
        <p><strong>Avg Delay Risk:</strong> {avgDelay} ({getSeverity(avgDelay)})</p>
        {renderBar(avgDelay)}
      </div>

      {flagged.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">🚩 Flagged Trips</h3>
          <ul className="list-disc pl-5 text-sm">
            {flagged.map((t, i) => (
              <li key={i}>
                {t.tripId} — {t.origin} to {t.destination} | Fuel: {t.analysis?.fuelRisk}, Fatigue: {t.analysis?.fatigueRisk}, Delay: {t.analysis?.delayRisk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}