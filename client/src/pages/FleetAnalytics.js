import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MonthlyTrendsChart from '../components/MonthlyTrendsChart';
import DriverLeaderboard from '../components/DriverLeaderboard';
import FleetSummary from '../components/FleetSummary';
import FleetExport from '../components/FleetExport';

const FleetAnalytics = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const snapshot = await getDocs(collection(db, 'trips'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(data);
    };
    fetchTrips();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">📊 Fleet Analytics</h1>
      <FleetSummary trips={trips} />
      <MonthlyTrendsChart trips={trips} />
      <DriverLeaderboard trips={trips} />
      <FleetExport trips={trips} />
    </div>
  );
};

export default FleetAnalytics;