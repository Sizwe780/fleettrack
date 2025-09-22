import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import FuelTrendChart from './FuelTrendChart';
import HealthScoreChart from './HealthScoreChart';

export default function FleetAnalytics() {
  const [fuelData, setFuelData] = useState([]);
  const [scoreData, setScoreData] = useState([]);
  const [loading, setLoading] = useState(true);

  // This useEffect hook will run once when the component is mounted
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all trip documents from the 'trips' collection
        const querySnapshot = await getDocs(collection(db, 'trips'));
        const trips = querySnapshot.docs.map(doc => doc.data());

        // Process the fetched data to populate your charts
        // This is a placeholder for your data processing logic
        const processedFuelData = trips.map(trip => ({
          date: trip.date,
          fuelUsed: trip.analysis?.ifta?.fuelUsed ?? 0,
        }));
        
        const processedScoreData = trips.map(trip => ({
          date: trip.date,
          healthScore: trip.healthScore ?? 0,
        }));

        setFuelData(processedFuelData);
        setScoreData(processedScoreData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // The empty array ensures this effect runs only once

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Fleet Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FuelTrendChart data={fuelData} />
        <HealthScoreChart data={scoreData} />
      </div>
    </div>
  );
}