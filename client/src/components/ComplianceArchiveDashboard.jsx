import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import TripSummaryCard from './TripSummaryCard';
import ComplianceExportPanel from './ComplianceExportPanel';

export default function ComplianceArchiveDashboard({ userId }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const path = `apps/fleet-track-app/users/${userId}/trips`;
      const snapshot = await getDocs(collection(db, path));
      const tripList = snapshot.docs.map(doc => ({ ...doc.data(), tripId: doc.id }));
      setTrips(tripList);
    };
    fetchTrips();
  }, [userId]);

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">🧾 Compliance Archive</h2>
      <ComplianceExportPanel trips={trips} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map(trip => (
          <TripSummaryCard key={trip.tripId} trip={trip} />
        ))}
      </div>
    </div>
  );
}