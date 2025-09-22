import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import TripSelector from '../components/TripSelector';
import TripComparisonTable from '../components/TripComparisonTable';

const TripCompare = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const snapshot = await getDocs(collection(db, 'trips'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(data);
    };
    fetchTrips();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🔍 Compare Trips</h1>
      <TripSelector trips={trips} onSelect={setSelectedTrips} />
      {selectedTrips.length >= 2 && (
        <TripComparisonTable trips={selectedTrips} />
      )}
    </div>
  );
};

export default TripCompare;