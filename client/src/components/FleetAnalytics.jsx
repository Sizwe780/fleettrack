import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import FuelTrendChart from './FuelTrendChart';

export default function FleetAnalytics() {
  const [fuelData, setFuelData] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const snapshot = await getDocs(collection(db, 'trips'));
      const trips = snapshot.docs.map(doc => doc.data());

      const fuelTrend = trips.reduce((acc, trip) => {
        const date = new Date(trip.date).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
        acc[date] = (acc[date] || 0) + (trip.analysis?.ifta?.fuelUsed ?? 0);
        return acc;
      }, {});

      const formatted = Object.entries(fuelTrend).map(([label, value]) => ({ label, value }));
      setFuelData(formatted);
    };

    fetchTrips();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">📊 Fleet Analytics</h2>
      <FuelTrendChart data={fuelData} />
      {/* Add more charts here later */}
    </div>
  );
}