import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import HeatMap from './HeatMap'; // Your custom map component with heatmap layer

const FleetPulseMap = () => {
  const [tripPoints, setTripPoints] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'trips'), (snapshot) => {
      const activeTrips = snapshot.docs
        .map(doc => doc.data())
        .filter(trip => trip.status !== 'completed')
        .map(trip => ({
          lat: trip.driverLocation?.latitude,
          lng: trip.driverLocation?.longitude,
          intensity: trip.status === 'critical' ? 1 : 0.5
        }))
        .filter(p => p.lat && p.lng);

      setTripPoints(activeTrips);
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-xl font-bold mb-4">Fleet Pulse Heatmap</h2>
      <HeatMap points={tripPoints} />
    </div>
  );
};

export default FleetPulseMap;