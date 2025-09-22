import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MonthlyHealthChart from '../components/MonthlyHealthChart';
import { groupBy } from 'lodash';

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

    const fuelEfficiency = distance && fuelUsed ? fuelUsed / distance * 100 : null;

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
  const topTrips = scoredTrips.filter(t => t.healthScore >= 90);

  const monthlyScores = Object.entries(
    groupBy(scoredTrips, trip => new Date(trip.date).toISOString().slice(0, 7))
  ).map(([month, trips]) => ({
    month,
    averageScore: Math.round(trips.reduce((sum, t) => sum + t.healthScore, 0) / trips.length),
  }));

  const exportFlaggedTrips = () => {
    const csv = flaggedTrips.map(t =>
      `${t.driver_name ?? 'Unknown'},${t.origin ?? 'N/A'},${t.destination ?? 'N/A'},${new Date(t.date).toLocaleDateString('en-ZA')},${t.healthScore}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flagged_trips.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading fleet data...</p>;
  }

  return (
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

      <MonthlyHealthChart data={monthlyScores} />

      {topTrips.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mt-6 mb-2">🏆 Top Performing Trips</h3>
          <ul className="list-disc list-inside text-green-600">
            {topTrips.map(t => (
              <li key={t.id}>
                {t.driver_name ?? 'Unknown'} — {t.origin ?? 'N/A'} → {t.destination ?? 'N/A'} ({new Date(t.date).toLocaleDateString('en-ZA')}) — Score: {t.healthScore}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold mt-6 mb-2">⚠️ Flagged Trips (Score &lt; 50)</h3>
        {flaggedTrips.length > 0 ? (
          <>
            <ul className="list-disc list-inside text-red-600">
              {flaggedTrips.map(t => (
                <li key={t.id}>
                  {t.driver_name ?? 'Unknown'} — {t.origin ?? 'N/A'} → {t.destination ?? 'N/A'} ({new Date(t.date).toLocaleDateString('en-ZA')}) — Score: {t.healthScore}
                </li>
              ))}
            </ul>
            <button
              onClick={exportFlaggedTrips}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Export Flagged Trips
            </button>
          </>
        ) : (
          <p className="text-gray-500">No critical trips found.</p>
        )}
      </div>
    </div>
  );
};

export default FleetHealth;