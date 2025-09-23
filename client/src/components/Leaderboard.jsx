import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Leaderboard = () => {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const entries = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(user => user.role === 'driver');

      const ranked = entries.sort((a, b) => {
        const scoreA = (a.avgHealthScore ?? 0) + (a.avgProfit ?? 0) / 100;
        const scoreB = (b.avgHealthScore ?? 0) + (b.avgProfit ?? 0) / 100;
        return scoreB - scoreA;
      });

      setDrivers(ranked);
    };

    fetchDrivers();
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border mb-6">
      <h2 className="text-xl font-bold mb-4">🏅 Driver Leaderboard</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th>Name</th>
            <th>Health Score</th>
            <th>Avg Profit</th>
            <th>Badges</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver, i) => (
            <tr key={driver.uid} className="border-b">
              <td>{driver.name ?? `Driver ${i + 1}`}</td>
              <td>{driver.avgHealthScore ?? '—'}</td>
              <td>R{driver.avgProfit?.toFixed(2) ?? '—'}</td>
              <td>{driver.badges?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;