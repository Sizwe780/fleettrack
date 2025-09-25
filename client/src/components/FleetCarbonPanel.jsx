import React from 'react';

export default function FleetCarbonPanel({ trips }) {
  const totalTrips = trips.length;
  const totalFuel = trips.reduce((sum, t) => sum + (t.fuelUsed || 0), 0);
  const totalCO2 = trips.reduce((sum, t) => sum + (t.emissionsCO2 || 0), 0);

  const avgFuel = (totalFuel / totalTrips).toFixed(2);
  const avgCO2 = (totalCO2 / totalTrips).toFixed(2);

  const topEmitters = [...trips.reduce((map, t) => {
    const name = t.driverName || 'Unknown';
    map.set(name, (map.get(name) || 0) + (t.emissionsCO2 || 0));
    return map;
  }, new Map())]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🌱 Fleet Carbon Panel</h2>
      <p><strong>Total Trips:</strong> {totalTrips}</p>
      <p><strong>Total Fuel Used:</strong> {totalFuel.toFixed(2)} L</p>
      <p><strong>Total CO₂ Emissions:</strong> {totalCO2.toFixed(2)} kg</p>
      <p><strong>Avg Fuel per Trip:</strong> {avgFuel} L</p>
      <p><strong>Avg CO₂ per Trip:</strong> {avgCO2} kg</p>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">🚨 Top Emission Drivers</h3>
        <ul className="list-disc pl-5 text-sm">
          {topEmitters.map(([name, co2], i) => (
            <li key={i}>{name} — CO₂: {co2.toFixed(2)} kg</li>
          ))}
        </ul>
      </div>
    </div>
  );
}