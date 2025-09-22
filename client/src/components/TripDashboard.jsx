import React from 'react';

const TripDashboard = ({ trip }) => {
  if (!trip) return <p>No trip data available.</p>;

  const {
    origin,
    destination,
    cycleUsed,
    driver_name,
    date,
    routeData,
    analysis,
  } = trip;

  const profit = analysis?.profitability?.netProfit ?? 0;
  const fuelUsed = analysis?.ifta?.fuelUsed ?? 0;
  const distance = routeData?.distance ?? 0;
  const costs = analysis?.profitability?.costs ?? {};
  const remarks = analysis?.remarks ?? '';

  const fuelEfficiency = distance && fuelUsed
    ? `${(fuelUsed / distance * 100).toFixed(2)} L/100km`
    : 'N/A';

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-md border">
      {/* Trip Summary */}
      <div className="text-xl font-semibold">
        🚚 {origin} → {destination}
      </div>
      <div className="text-sm text-gray-600">
        Driver: {driver_name} | Date: {date} | Cycle Time: {cycleUsed} hrs
      </div>

      {/* Profit & Fuel */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-green-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">💰 Profit</h3>
          <p className="text-2xl text-green-700">R{profit}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">⛽ Fuel Efficiency</h3>
          <p className="text-2xl text-blue-700">{fuelEfficiency}</p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">📊 Cost Breakdown</h3>
        <ul className="list-disc list-inside text-gray-700">
          {Object.entries(costs).map(([key, value]) => (
            <li key={key}>
              {key}: R{value}
            </li>
          ))}
        </ul>
      </div>

      {/* Route Stats */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">🧭 Route Stats</h3>
        <p>Distance: {distance} km</p>
        <p>Average Speed: {routeData?.avgSpeed ?? 'N/A'} km/h</p>
      </div>

      {/* Remarks */}
      {remarks && (
        <div className="mt-6 bg-yellow-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">⚠️ Remarks</h3>
          <p>{remarks}</p>
        </div>
      )}
    </div>
  );
};

export default TripDashboard;