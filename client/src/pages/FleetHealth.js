import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SidebarLayout from '../components/SidebarLayout';
import MonthlyHealthChart from '../components/MonthlyHealthChart';

const FleetHealth = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const snapshot = await getDocs(collection(db, 'trips'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(data);
      setLoading(false);
    };

    fetchTrips();
  }, []);

  const calculateHealthScore = (trip) => {
    const profit = trip.analysis?.profitability?.netProfit ?? 0;
    const fuelUsed = trip.analysis?.ifta?.fuelUsed ?? 0;
    const distance = trip.routeData?.distance ?? 0;
    const cycleUsed = Number(trip.cycleUsed ?? 0);

    const fuelEfficiency = distance && fuelUsed ? (fuelUsed / distance) * 100 : null;

    let score = 100;
    if (fuelEfficiency !== null) {
      if (fuelEfficiency > 15) score -= 30;
      else if (fuelEfficiency > 12) score -= 15;
    }
    if (profit < 5000) score -= 20;
    if (cycleUsed > 10) score -= 10;

    return Math.max(score, 0);
  };

  const scoredTrips = trips.map(trip => ({
    ...trip,
    healthScore: calculateHealthScore(trip),
  }));

  const averageScore = scoredTrips.length
    ? Math.round(scoredTrips.reduce((sum, t) => sum + t.healthScore, 0) / scoredTrips.length)
    : 0;

  const flaggedTrips = scoredTrips.filter(t => t.healthScore < 50);

  if (loading) {
    return (
      <SidebarLayout role="admin" title="Fleet Health">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout role="admin" title="Fleet Health">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">🩺 Fleet Health Overview</h1>

        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">Average Fleet Score</h3>
          <p className={`text-3xl font-bold ${
            averageScore >= 80 ? 'text-green-600' :
            averageScore >= 50 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {averageScore}/100
          </p>
        </div>

        {/* Optional Chart */}
        <MonthlyHealthChart trips={scoredTrips} />

        <div>
          <h3 className="text-lg font-bold mt-6 mb-2">⚠️ Flagged Trips (Score &lt; 50)</h3>
          {flaggedTrips.length > 0 ? (
            <ul className="list-disc list-inside text-red-600">
              {flaggedTrips.map(t => (
                <li key={t.id}>
                  {t.driver_name ?? 'Unknown'} — {t.origin ?? 'N/A'} → {t.destination ?? 'N/A'} ({new Date(t.date).toLocaleDateString('en-ZA')}) — Score: {t.healthScore}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No critical trips found.</p>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default FleetHealth;