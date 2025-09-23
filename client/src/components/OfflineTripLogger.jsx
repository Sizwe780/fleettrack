import React, { useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const OfflineTripLogger = () => {
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    driver_name: '',
    cycleUsed: '',
    date: new Date().toISOString().split('T')[0],
    departureTime: '08:00'
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [status, setStatus] = useState('');
  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync any cached trips
    if (navigator.onLine) {
      const cachedTrips = JSON.parse(localStorage.getItem('offlineTrips') || '[]');
      cachedTrips.forEach(async (trip) => {
        try {
          await addDoc(collection(db, 'trips'), trip);
          setStatus('Synced offline trip: ' + trip.origin + ' → ' + trip.destination);
        } catch (err) {
          console.error('Sync failed:', err);
        }
      });
      localStorage.removeItem('offlineTrips');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tripData = {
      ...form,
      driver_uid: userId,
      status: 'pending',
      healthScore: 100
    };

    if (isOffline) {
      const cached = JSON.parse(localStorage.getItem('offlineTrips') || '[]');
      cached.push(tripData);
      localStorage.setItem('offlineTrips', JSON.stringify(cached));
      setStatus('Trip saved offline. Will sync when online.');
    } else {
      try {
        await addDoc(collection(db, 'trips'), tripData);
        setStatus('Trip submitted successfully.');
      } catch (err) {
        console.error('Trip submission error:', err);
        setStatus('Error submitting trip.');
      }
    }

    setForm({
      origin: '',
      destination: '',
      driver_name: '',
      cycleUsed: '',
      date: new Date().toISOString().split('T')[0],
      departureTime: '08:00'
    });
  };

  const Input = ({ label, name, value, type = 'text' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        value={value}
        type={type}
        onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
        required
        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-xl font-bold mb-4">Offline Trip Logger</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Origin" name="origin" value={form.origin} />
        <Input label="Destination" name="destination" value={form.destination} />
        <Input label="Driver Name" name="driver_name" value={form.driver_name} />
        <Input label="Cycle Used (hrs)" name="cycleUsed" value={form.cycleUsed} type="number" />
        <Input label="Trip Date" name="date" value={form.date} type="date" />
        <Input label="Departure Time" name="departureTime" value={form.departureTime} type="time" />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          {isOffline ? 'Save Offline' : 'Submit Trip'}
        </button>
      </form>
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
      {isOffline && (
        <p className="mt-2 text-xs text-red-500">Offline mode active. Trip will sync when online.</p>
      )}
    </div>
  );
};

export default OfflineTripLogger;