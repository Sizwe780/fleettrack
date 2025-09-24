import React from 'react';

export default function TripRiskDashboard({ trip }) {
  const riskColor = (value) => {
    if (value > 0.8) return 'bg-red-500';
    if (value > 0.6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Trip Risk Dashboard</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className={`p-2 rounded ${riskColor(trip.fuelRisk)}`}>Fuel Risk: {trip.fuelRisk}</div>
        <div className={`p-2 rounded ${riskColor(trip.delayRisk)}`}>Delay Risk: {trip.delayRisk}</div>
        <div className={`p-2 rounded ${riskColor(trip.fatigueRisk)}`}>Fatigue Risk: {trip.fatigueRisk}</div>
        {trip.slaBreached && (
          <div className="p-2 rounded bg-red-600 text-white">
            SLA Breach: {trip.slaDuration}h / {trip.slaLimit}h
          </div>
        )}
      </div>
    </div>
  );
}