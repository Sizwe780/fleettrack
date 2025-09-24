import React from 'react';

export default function FleetOpsAI({ trips, drivers, vehicles }) {
  const recentTrips = trips.slice(-50); // last 50 trips for context

  const fatigueScores = {};
  const vehicleScores = {};

  recentTrips.forEach(t => {
    const uid = t.driver_uid;
    const vid = t.vehicle_id;
    const fatigue = t.analysis?.fatigueRisk ?? 0;
    const fuel = t.analysis?.fuelRisk ?? 0;
    const delay = t.analysis?.delayRisk ?? 0;

    fatigueScores[uid] = (fatigueScores[uid] || 0) + fatigue;
    vehicleScores[vid] = (vehicleScores[vid] || 0) + fuel + delay;
  });

  const rankedPairs = [];

  drivers.forEach(driver => {
    vehicles.forEach(vehicle => {
      const fatigue = (fatigueScores[driver.uid] || 0) / 5;
      const vehicleRisk = (vehicleScores[vehicle.id] || 0) / 5;
      const totalRisk = fatigue + vehicleRisk;

      rankedPairs.push({
        driver: driver.name,
        vehicle: vehicle.id,
        fatigue: fatigue.toFixed(2),
        vehicleRisk: vehicleRisk.toFixed(2),
        totalRisk: totalRisk.toFixed(2),
      });
    });
  });

  const sorted = rankedPairs.sort((a, b) => a.totalRisk - b.totalRisk).slice(0, 10);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🧠 FleetOps AI Dispatch Suggestions</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Fatigue</th>
            <th>Vehicle Risk</th>
            <th>Total Risk</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((pair, i) => (
            <tr key={i} className="border-b">
              <td>{pair.driver}</td>
              <td>{pair.vehicle}</td>
              <td>{pair.fatigue}</td>
              <td>{pair.vehicleRisk}</td>
              <td className={pair.totalRisk > 1.2 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {pair.totalRisk}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}