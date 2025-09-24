import React, { useState, useEffect } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function OfflineTripLogger({ userId }) {
  const [tripData, setTripData] = useState(() => {
    const saved = localStorage.getItem('offlineTrip');
    return saved ? JSON.parse(saved) : { origin: '', destination: '', notes: '' };
  });
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    localStorage.setItem('offlineTrip', JSON.stringify(tripData));
  }, [tripData]);

  const handleSubmit = async () => {
    setStatus('saving');
    try {
      const payload = {
        ...tripData,
        driver_uid: userId,
        createdAt: new Date().toISOString(),
        offline: true,
        status: 'pending',
        statusHistory: [{ status: 'pending', timestamp: new Date().toISOString() }],
      };

      const id = `offline-${Date.now()}`;
      await setDoc(doc(db, 'apps/fleet-track-app/trips', id), payload);
      localStorage.removeItem('offlineTrip');
      setTripData({ origin: '', destination: '', notes: '' });
      setStatus('success');
    } catch (err) {
      console.error('OfflineTripLogger error:', err.message);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow text-sm">
      <h2 className="text-xl font-bold mb-4">📴 Offline Trip Logger</h2>

      <input
        type="text"
        placeholder="Origin"
        value={tripData.origin}
        onChange={e => setTripData({ ...tripData, origin: e.target.value })}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Destination"
        value={tripData.destination}
        onChange={e => setTripData({ ...tripData, destination: e.target.value })}
        className="w-full mb-2 p-2 border rounded"
      />
      <textarea
        placeholder="Trip Notes"
        value={tripData.notes}
        onChange={e => setTripData({ ...tripData, notes: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
      >
        Submit Offline Trip
      </button>

      {status === 'saving' && <p className="mt-2 text-xs text-gray-500">Saving trip...</p>}
      {status === 'success' && <p className="mt-2 text-xs text-green-600">Trip saved and synced!</p>}
      {status === 'error' && <p className="mt-2 text-xs text-red-600">Error saving trip.</p>}
    </div>
  );
}