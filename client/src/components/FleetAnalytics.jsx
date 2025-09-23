import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import FuelTrendChart from './FuelTrendChart';

export default function FleetAnalytics() {
  const [fuelData, setFuelData] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'apps/fleet-track-app/allTrips'));
        const trips = snapshot.docs.map(doc => doc.data());

        const fuelTrend = trips.reduce((acc, trip) => {
          const rawDate = trip.date ?? null;
          const fuelUsed = trip.analysis?.ifta?.fuelUsed ?? 0;

          if (!rawDate || typeof fuelUsed !== 'number') return acc;

          const dateKey = new Date(rawDate).toLocaleDateString('en-ZA', {
            month: 'short',
            year: 'numeric'
          });

          acc[dateKey] = (acc[dateKey] || 0) + fuelUsed;
          return acc;
        }, {});

        const formatted = Object.entries(fuelTrend)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => new Date(`01 ${a.label}`) - new Date(`01 ${b.label}`));

        setFuelData(formatted);
      } catch (err) {
        console.error('FleetAnalytics fetch error:', err);
        setFuelData([]);
      }
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