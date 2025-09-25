import React from 'react';

export default function DriverBehaviorPanel({ trips }) {
  const driverStats = {};

  trips.forEach(trip => {
    const name = trip.driverName || 'Unknown';
    if (!driverStats[name]) {
      driverStats[name] = {
        trips: 0,
        fatigue: 0,
        speeding: 0,
        braking: 0
      };
    }

    driverStats[name].trips += 1;
    driverStats[name].fatigue += trip.analysis?.fatigueRisk || 0;
    driverStats[name].speeding += trip.driverFlags?.filter(f => f.includes('Speeding')).length || 0;
    driverStats[name].braking += trip.driverFlags?.filter(f => f.includes('Harsh braking')).length || 0;
  });

  const rankedDrivers = Object.entries(driverStats)
    .map(([name, stats]) => ({
      name,
      avgFatigue: (stats.fatigue / stats.trips).toFixed(2),
      speeding: stats.speeding,
      braking: stats.braking
    }))
    .sort((a, b) => b.avgFatigue - a.avgFatigue || b.speeding - a.speeding || b.braking - a.braking);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🧠 Driver Behavior Panel</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Driver</th>
            <th>Avg Fatigue</th>
            <th>Speeding Flags</th>
            <th>Braking Flags</th>
          </tr>
        </thead>
        <tbody>
          {rankedDrivers.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.avgFatigue}</td>
              <td>{d.speeding}</td>
              <td>{d.braking}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}