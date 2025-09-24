import React from 'react';

export default function VehicleHealthOverlay({ trips }) {
  const healthByVehicle = {};

  trips.forEach(trip => {
    const id = trip.vehicle_id;
    const odo = trip.odometer_start || 0;
    const fuel = trip.analysis?.fuelRisk ?? 0;
    const fatigue = trip.analysis?.fatigueRisk ?? 0;
    const delay = trip.analysis?.delayRisk ?? 0;

    if (!healthByVehicle[id]) {
      healthByVehicle[id] = { totalOdo: 0, tripCount: 0, fuelSum: 0, fatigueSum: 0, delaySum: 0 };
    }

    healthByVehicle[id].totalOdo += odo;
    healthByVehicle[id].tripCount += 1;
    healthByVehicle[id].fuelSum += fuel;
    healthByVehicle[id].fatigueSum += fatigue;
    healthByVehicle[id].delaySum += delay;
  });

  const vehicleScores = Object.entries(healthByVehicle).map(([id, data]) => ({
    id,
    avgFuel: (data.fuelSum / data.tripCount).toFixed(2),
    avgFatigue: (data.fatigueSum / data.tripCount).toFixed(2),
    avgDelay: (data.delaySum / data.tripCount).toFixed(2),
    totalOdo: data.totalOdo,
    tripCount: data.tripCount,
    serviceDue: data.totalOdo > 10000 || data.tripCount > 50, // example thresholds
  }));

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🚗 Vehicle Health Overlay</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th>Vehicle</th>
            <th>Trips</th>
            <th>Odometer</th>
            <th>Fuel</th>
            <th>Fatigue</th>
            <th>Delay</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicleScores.map(v => (
            <tr key={v.id} className="border-b">
              <td>{v.id}</td>
              <td>{v.tripCount}</td>
              <td>{v.totalOdo}</td>
              <td>{v.avgFuel}</td>
              <td>{v.avgFatigue}</td>
              <td>{v.avgDelay}</td>
              <td className={v.serviceDue ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {v.serviceDue ? '🛠️ Service Due' : '✅ Healthy'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}