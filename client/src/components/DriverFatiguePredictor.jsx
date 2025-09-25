import React from 'react';

export default function DriverFatiguePredictor({ trips }) {
  const driverStats = {};

  trips.forEach(trip => {
    const name = trip.driverName || 'Unknown';
    if (!driverStats[name]) {
      driverStats[name] = {
        fatigueSum: 0,
        fatigueCount: 0,
        recentTrips: []
      };
    }

    const fatigue = trip.analysis?.fatigueRisk || 0;
    driverStats[name].fatigueSum += fatigue;
    driverStats[name].fatigueCount += 1;
    driverStats[name].recentTrips.push({
      tripId: trip.tripId,
      fatigue,
      duration: trip.duration,
      startTime: trip.startTime
    });
  });

  const predictions = Object.entries(driverStats).map(([name, stats]) => {
    const avgFatigue = (stats.fatigueSum / stats.fatigueCount).toFixed(2);
    const recent = stats.recentTrips.slice(-3).map(t => `${t.tripId} (${t.fatigue})`).join(', ');
    return {
      name,
      avgFatigue,
      recentTrips: recent
    };
  }).sort((a, b) => b.avgFatigue - a.avgFatigue);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">💤 Driver Fatigue Predictor</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Driver</th>
            <th>Avg Fatigue Risk</th>
            <th>Recent Trips</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td style={{ color: d.avgFatigue > 7 ? '#d00' : '#28a745' }}>{d.avgFatigue}</td>
              <td>{d.recentTrips}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
