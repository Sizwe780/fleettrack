import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const DriverLeaderboard = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'trips'));
        const trips = snapshot.docs.map(doc => doc.data());

        const grouped = trips.reduce((acc, trip) => {
          const uid = trip.driver_uid;
          if (!uid) return acc;

          const name = trip.driver_name ?? 'Unnamed Driver';
          const score = trip.healthScore ?? 0;
          const profit = trip.analysis?.profitability?.netProfit ?? 0;

          if (!acc[uid]) {
            acc[uid] = { uid, name, profit: 0, scoreSum: 0, count: 0 };
          }

          acc[uid].profit += profit;
          acc[uid].scoreSum += score;
          acc[uid].count += 1;

          return acc;
        }, {});

        const ranked = Object.values(grouped)
          .map(d => ({
            ...d,
            avgScore: d.count > 0 ? Math.round(d.scoreSum / d.count) : 0
          }))
          .sort((a, b) => b.profit - a.profit);

        setDrivers(ranked);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">🏆 Driver Leaderboard</h2>

      {loading ? (
        <p className="text-gray-500">Loading leaderboard...</p>
      ) : drivers.length === 0 ? (
        <p className="text-gray-500">No driver data available.</p>
      ) : (
        <div className="space-y-2">
          {drivers.map((d, i) => (
            <div
              key={d.uid}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{i + 1}. {d.name}</p>
                <p className="text-sm text-gray-500">
                  Avg Score: <span className={getScoreColor(d.avgScore)}>{d.avgScore}/100</span> · {d.count} trips
                </p>
              </div>
              <p className="text-blue-600 font-semibold">
                R{d.profit.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverLeaderboard;