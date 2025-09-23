import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const DriverLeaderboard = () => {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const tripsSnap = await getDocs(collection(db, 'trips'));

        const tripData = tripsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const driverData = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === 'driver')
          .map(driver => {
            const driverTrips = tripData.filter(t => t.driver_uid === driver.id);
            const totalTrips = driverTrips.length;
            const avgProfit = driverTrips.reduce((acc, t) => acc + (t.analysis?.profitability?.netProfit ?? 0), 0) / (totalTrips || 1);
            const avgScore = driverTrips.reduce((acc, t) => acc + (t.healthScore ?? 0), 0) / (totalTrips || 1);

            return {
              name: driver.name || driver.email,
              totalTrips,
              avgProfit: Math.round(avgProfit),
              avgScore: Math.round(avgScore)
            };
          });

        const sorted = driverData.sort((a, b) => b.avgScore - a.avgScore);
        setDrivers(sorted);
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-xl font-bold mb-4">Driver Performance Leaderboard</h2>
      {isLoading ? (
        <p className="text-gray-500">Loading leaderboard...</p>
      ) : drivers.length === 0 ? (
        <p className="text-gray-500">No drivers found.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Driver</th>
              <th className="py-2">Trips</th>
              <th className="py-2">Avg Profit</th>
              <th className="py-2">Health Score</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 font-medium">{d.name}</td>
                <td className="py-2">{d.totalTrips}</td>
                <td className="py-2">R{d.avgProfit}</td>
                <td className="py-2">{d.avgScore}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DriverLeaderboard;