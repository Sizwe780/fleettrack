import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function DriverLeaderboard() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const path = `apps/fleet-track-app/trips`;
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const grouped = {};

        trips.forEach(trip => {
          const name = trip.driver_name ?? 'Unknown';
          if (!grouped[name]) {
            grouped[name] = { name, trips: 0, score: 0, profit: 0 };
          }
          grouped[name].trips += 1;
          grouped[name].score += trip.analysis?.healthScore ?? 0;
          grouped[name].profit += trip.analysis?.profitability?.netProfit ?? 0;
        });

        const ranked = Object.values(grouped).map(d => ({
          ...d,
          avgScore: Math.round(d.score / d.trips),
          avgProfit: Math.round(d.profit / d.trips),
        })).sort((a, b) => b.avgScore - a.avgScore);

        setDrivers(ranked);
      },
      (error) => {
        console.error('Leaderboard error:', error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-10 max-w-3xl mx-auto text-sm">
      <h2 className="text-xl font-bold mb-4">🏆 Driver Leaderboard</h2>
      <table className="w-full border text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Driver</th>
            <th className="p-2 text-left">Trips</th>
            <th className="p-2 text-left">Avg Score</th>
            <th className="p-2 text-left">Avg Profit</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d, i) => (
            <tr key={i} className={i === 0 ? 'bg-yellow-50 font-semibold' : ''}>
              <td className="p-2">{d.name}</td>
              <td className="p-2">{d.trips}</td>
              <td className="p-2">{d.avgScore}/100</td>
              <td className="p-2">R{d.avgProfit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}