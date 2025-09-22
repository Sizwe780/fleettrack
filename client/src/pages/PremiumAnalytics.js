import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const PremiumAnalytics = ({ user }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?.uid) return;

      const ref = collection(db, `apps/fleet-track-app/users/${user.uid}/trips`);
      const snap = await getDocs(ref);
      const data = snap.docs.map(doc => doc.data());
      setTrips(data);
      setLoading(false);
    };
    fetchTrips();
  }, [user]);

  const totalRevenue = trips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Fleet Analytics</h2>

      {loading ? (
        <p className="text-gray-500">Loading trip data...</p>
      ) : (
        <>
          <p className="text-lg text-gray-700 mb-2">
            Total Revenue: <span className="font-bold text-green-600">R{totalRevenue.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-500">Trips analyzed: {trips.length}</p>
          {/* Future: Add charts here */}
        </>
      )}
    </div>
  );
};

export default PremiumAnalytics;