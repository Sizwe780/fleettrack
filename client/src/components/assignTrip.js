import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AssignTrip = () => {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const tripSnap = await getDocs(collection(db, 'trips'));
      const driverSnap = await getDocs(collection(db, 'users'));

      setTrips(tripSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setDrivers(driverSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const assignTrip = async () => {
    if (!selectedTrip || !selectedDriver) return;

    await updateDoc(doc(db, 'trips', selectedTrip), {
      driver_uid: selectedDriver,
      status: 'assigned'
    });

    await setDoc(doc(db, 'driver_alerts', `${selectedTrip}_${selectedDriver}`), {
      driver_uid: selectedDriver,
      tripId: selectedTrip,
      message: 'New trip assigned to you',
      timestamp: new Date().toISOString()
    });

    setSuccess(true);
    setSelectedTrip('');
    setSelectedDriver('');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">🧭 Assign Trip to Driver</h2>

      <div className="space-y-4 bg-white p-4 rounded shadow">
        <select
          value={selectedTrip}
          onChange={(e) => setSelectedTrip(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Trip</option>
          {trips.map(t => (
            <option key={t.id} value={t.id}>
              {t.origin} → {t.destination}
            </option>
          ))}
        </select>

        <select
          value={selectedDriver}
          onChange={(e) => setSelectedDriver(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Driver</option>
          {drivers.map(d => (
            <option key={d.uid} value={d.uid}>
              {d.name ?? d.uid}
            </option>
          ))}
        </select>

        <button
          onClick={assignTrip}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Assign Trip
        </button>

        {success && (
          <p className="text-green-600 text-sm mt-2">✅ Trip assigned successfully!</p>
        )}
      </div>
    </div>
  );
};

export default AssignTrip;