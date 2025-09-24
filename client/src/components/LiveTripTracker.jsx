import React, { useEffect, useState } from 'react';

export default function LiveTripTracker({ tripId }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('On Duty');

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setStatus('Driving');
      },
      err => {
        console.warn('Live tracking error:', err.message);
        setStatus('Off Duty');
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
      <h4 className="font-semibold mb-2">📍 Live Trip Tracker</h4>
      <p>Status: <strong>{status}</strong></p>
      {location && (
        <p>Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
      )}
    </div>
  );
}