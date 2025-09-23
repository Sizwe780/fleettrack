import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import FAKE_BACKEND_tripAnalysis from '../utils/fakeBackend';

const OfflineTripLogger = ({ appId }) => {
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    cycleUsed: '',
    driver_name: '',
    date: new Date().toISOString().split('T')[0],
    departureTime: '',
  });

  const [status, setStatus] = useState(null);
  const [offlineTrips, setOfflineTrips] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('fleettrack_offline_trips');
    if (saved) setOfflineTrips(JSON.parse(saved));
  }, []);

  const saveOffline = (trip) => {
    const updated = [...offlineTrips, trip];
    setOfflineTrips(updated);
    localStorage.setItem('fleettrack_offline_trips', JSON.stringify(updated));
  };

  const syncTrips = async () => {
    const user = getAuth().currentUser;
    if (!user || offlineTrips.length === 0) return;

    for (const trip of offlineTrips) {
      const newTripData = await FAKE_BACKEND_tripAnalysis(trip, user.uid);
      const safeTripData = {
        ...newTripData,
        driver_uid: user.uid,
        createdAt: new Date(),
      };
      await addDoc(collection(db, `apps/${appId}/trips`), safeTripData);
    }

    localStorage.removeItem('fleettrack_offline_trips');
    setOfflineTrips([]);
    setStatus('synced');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');

    const user = getAuth().currentUser;
    const trip = {
      ...form,
      driver_name: user?.displayName ?? 'Offline Driver',
    };

    saveOffline(trip);
    setForm({
      origin: '',
      destination: '',
      cycleUsed: '',
      driver_name: '',
      date: new Date().toISOString().split('T')[0],
      departureTime: '',
    });
    setStatus('saved');
  };

  return (
    <div className="border rounded-xl p-4 bg-white shadow-md mt-6">
      <h2 className="text-lg font-bold mb-2">📴 Offline Trip Logger</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <input placeholder="Origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="w-full border rounded px-3 py-2" />
        <input placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full border rounded px-3 py-2" />
        <input placeholder="Cycle Used (hrs)" value={form.cycleUsed} onChange={(e) => setForm({ ...form, cycleUsed: e.target.value })} className="w-full border rounded px-3 py-2" />
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border rounded px-3 py-2" />
        <input type="time" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save Trip Offline
        </button>
        {status === 'saved' && <p className="text-green-600 mt-2">Trip saved offline.</p>}
        {status === 'synced' && <p className="text-blue-600 mt-2">Offline trips synced.</p>}
      </form>

      {offlineTrips.length > 0 && (
        <div className="mt-4 text-sm">
          <p><strong>Offline Trips:</strong> {offlineTrips.length}</p>
          <button onClick={syncTrips} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Sync to Cloud
          </button>
        </div>
      )}
    </div>
  );
};

export default OfflineTripLogger;