import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import Map from './Map'; // Your reusable map component

const DriverLocationMap = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'driverLocations'), (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLocations(liveData);
    });

    return () => unsub();
  }, []);

  return (
    <div className="mt-4 p-4 bg-white rounded-xl shadow-md border">
      <h3 className="text-lg font-semibold mb-2">Live Driver Locations</h3>
      <Map markers={locations.map(loc => ({
        lat: loc.latitude,
        lng: loc.longitude,
        label: loc.driver_name
      }))} />
    </div>
  );
};

export default DriverLocationMap;