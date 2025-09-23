import React from 'react';

const DriverLeaderboard = ({ trips }) => {
  const driverStats = {};

  trips.forEach((trip) => {
    const uid = trip.driver_uid;
    if (!driverStats[uid]) {
      driverStats[uid] = {
        name: trip.driver_name,
        trips: 0,
        totalScore: 0,
        totalProfit: 0,
      };
    }
    driverStats[uid].trips += 1;
    driverStats[uid].totalScore += trip.healthScore ?? 0;
    driverStats[uid].totalProfit += trip.analysis?.profitability?.netProfit ?? 0;
  });

  const ranked = Object.values(driverStats)
    .map((d) => ({
      ...d,
      avgScore: Math.round(d.totalScore / d.trips),
      avgProfit: Math.round(d.totalProfit / d.trips),
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">🏆 Driver Leaderboard</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Driver</th>
            <th className="p-2">Trips</th>
            <th className="p-2">Avg Score</th>
            <th className="p-2">Avg Profit</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((d, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{d.name}</td>
              <td className="p-2 text-center">{d.trips}</td>
              <td className="p-2 text-center">{d.avgScore}</td>
              <td className="p-2 text-center">R{d.avgProfit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriverLeaderboard;