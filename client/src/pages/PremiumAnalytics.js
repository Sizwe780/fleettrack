// src/components/widgets/PremiumAnalytics.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const PremiumAnalytics = ({ user }) => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const ref = collection(db, 'trips');
      const snap = await getDocs(ref);
      const data = snap.docs.map(doc => doc.data());
      setTrips(data);
    };
    fetchTrips();
  }, []);

  const totalRevenue = trips.reduce((sum, trip) => sum + trip.revenue, 0);

  return (
    <div className="analytics">
      <h2>Fleet Analytics</h2>
      <p>Total Revenue: R{totalRevenue.toFixed(2)}</p>
      {/* Add charts here */}
    </div>
  );
};

export default PremiumAnalytics;