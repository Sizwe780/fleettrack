import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const DriverSyncAgent = ({ tripId }) => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [status, setStatus] = useState('en_route');
  const [healthScore, setHealthScore] = useState(100);
  const [syncStatus, setSyncStatus] = useState('');
  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!navigator.geolocation) {
      setSyncStatus('Geolocation not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => setSyncStatus('Unable to fetch location.')
    );
  }, []);

  const handleSync = async () => {
    if (!tripId || !userId || !location.lat || !location.lng) {
      setSyncStatus('Missing data for sync.');
      return;
    }

    try {
      await updateDoc(doc(db, 'trips', tripId), {
        status,
        healthScore,
        driverLocation: {
          latitude: location.lat,
          longitude: location.lng,
          timestamp: new Date().toISOString()
        },
        statusHistory: [
          ...(trip.statusHistory ?? []),
          {
            status,
            timestamp: new Date().toISOString()
          }
        ]
      });
      setSyncStatus('Trip synced successfully.');
    } catch (err) {
      console.error('Sync error:', err);
      setSyncStatus('Error syncing trip.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-lg font-bold mb-2">Driver Sync Agent</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Trip Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="en_route">En Route</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Health Score</label>
          <input
            type="number"
            value={healthScore}
            onChange={(e) => setHealthScore(Number(e.target.value))}
            className="mt-1 block w-full border rounded-md p-2"
            min={0}
            max={100}
          />
        </div>

        <button
          onClick={handleSync}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Sync Trip
        </button>

        {syncStatus && <p className="text-sm text-gray-600 mt-2">{syncStatus}</p>}
      </div>
    </div>
  );
};

export default DriverSyncAgent;