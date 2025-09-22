import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const DriverLeaderboard = () => {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const snapshot = await getDocs(collection(db, 'trips'));
      const trips = snapshot.docs.map(doc => doc.data());

      const grouped = trips.reduce((acc, trip) => {
        const uid = trip.driver_uid;
        if (!uid) return acc;
        if (!acc[uid]) acc[uid] = { uid, name: trip.driver_name, profit: 0, scoreSum: 0, count: 0 };
        acc[uid].profit += trip.analysis?.profitability?.netProfit ?? 0;
        acc[uid].scoreSum += trip.healthScore ?? 0;
        acc[uid].count += 1;
        return acc;
      }, {});

      const ranked = Object.values(grouped).map(d => ({
        ...d,
        avgScore: Math.round(d.scoreSum / d.count)
      })).sort((a, b) => b.profit - a.profit);

      setDrivers(ranked);
    };

    fetchTrips();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">🏆 Driver Leaderboard</h2>
      <div className="space-y-2">
        {drivers.map((d, i) => (
          <div key={d.uid} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-bold">{i + 1}. {d.name}</p>
              <p className="text-sm text-gray-500">Avg Score: {d.avgScore}/100</p>
            </div>
            <p className="text-blue-600 font-semibold">R{d.profit.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverLeaderboard;