import React from 'react';

export default function DriverFatigueMonitor({ trips }) {
  const fatigueByDriver = {};

  trips.forEach(trip => {
    const uid = trip.driver_uid;
    const fatigue = trip.analysis?.fatigueRisk ?? 0;
    const cycle = trip.cycleUsed || 'Unknown';

    if (!fatigueByDriver[uid]) {
      fatigueByDriver[uid] = { total: 0, count: 0, cycles: new Set(), name: trip.driver_name };
    }

    fatigueByDriver[uid].total += fatigue;
    fatigueByDriver[uid].count += 1;
    fatigueByDriver[uid].cycles.add(cycle);
  });

  const driverScores = Object.entries(fatigueByDriver).map(([uid, data]) => ({
    uid,
    name: data.name || 'Unknown',
    avgFatigue: (data.total / data.count).toFixed(2),
    tripCount: data.count,
    cyclesUsed: Array.from(data.cycles),
    flagged: data.total / data.count > 0.6,
  }));

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">😴 Driver Fatigue Monitor</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th>Driver</th>
            <th>Trips</th>
            <th>Cycles</th>
            <th>Avg Fatigue</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {driverScores.map(d => (
            <tr key={d.uid} className="border-b">
              <td>{d.name}</td>
              <td>{d.tripCount}</td>
              <td>{d.cyclesUsed.join(', ')}</td>
              <td>{d.avgFatigue}</td>
              <td className={d.flagged ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {d.flagged ? '⚠️ Overworked' : '✅ OK'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}