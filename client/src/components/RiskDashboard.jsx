import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function RiskDashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const snapshot = await getDocs(collection(db, 'apps/fleet-track-app/trips'));
      const allTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(allTrips);
      setLoading(false);
    };
    fetchTrips();
  }, []);

  const totalTrips = trips.length;
  const slaBreaches = trips.filter(t => t.slaBreached).length;
  const flaggedTrips = trips.filter(t => t.status === 'critical').length;

  const avgFuelRisk = average(trips.map(t => t.analysis?.fuelRisk));
  const avgFatigueRisk = average(trips.map(t => t.analysis?.fatigueRisk));
  const avgDelayRisk = average(trips.map(t => t.analysis?.delayRisk));

  function average(arr) {
    const valid = arr.filter(v => typeof v === 'number');
    return valid.length ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2) : 'N/A';
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-navy mb-4">🧪 Fleet Risk Dashboard</h2>

      {loading ? (
        <p>Loading risk metrics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Trips" value={totalTrips} />
          <Card title="SLA Breaches" value={slaBreaches} highlight />
          <Card title="Flagged Trips" value={flaggedTrips} highlight />

          <Card title="Avg Fuel Risk" value={avgFuelRisk} />
          <Card title="Avg Fatigue Risk" value={avgFatigueRisk} />
          <Card title="Avg Delay Risk" value={avgDelayRisk} />
        </div>
      )}
    </div>
  );
}

function Card({ title, value, highlight }) {
  return (
    <div className={`p-4 rounded shadow-md border ${highlight ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className={`text-2xl font-bold ${highlight ? 'text-red-700' : 'text-navy'}`}>{value}</p>
    </div>
  );
}