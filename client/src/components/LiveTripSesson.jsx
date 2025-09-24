import React, { useEffect, useState } from 'react';

export default function LiveTripSession({ trip }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        const entry = {
          time: new Date().toISOString(),
          status: 'Driving',
          location: { lat: latitude, lng: longitude },
        };
        setEvents(prev => [...prev, entry]);
      },
      err => {
        console.warn('Tracking error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const logStop = () => setEvents(prev => [...prev, { time: new Date().toISOString(), status: 'Stopped for rest' }]);
  const logFuel = () => setEvents(prev => [...prev, { time: new Date().toISOString(), status: 'Fuel check' }]);
  const logMaintenance = () => setEvents(prev => [...prev, { time: new Date().toISOString(), status: 'Maintenance check' }]);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded shadow text-sm">
      <h4 className="font-semibold mb-2">🛰️ Live Trip Session</h4>
      <button onClick={logStop} className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded">Log Stop</button>
      <button onClick={logFuel} className="mr-2 px-2 py-1 bg-green-500 text-white rounded">Log Fuel</button>
      <button onClick={logMaintenance} className="px-2 py-1 bg-red-500 text-white rounded">Log Maintenance</button>
      <ul className="mt-4 space-y-1">
        {events.map((e, i) => (
          <li key={i}>{e.time} — {e.status}</li>
        ))}
      </ul>
    </div>
  );
}