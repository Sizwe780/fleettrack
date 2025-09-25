import React, { useState } from 'react';

export default function FlightPlanner({ onLaunch }) {
  const [aircraft, setAircraft] = useState('');
  const [pilot, setPilot] = useState('');
  const [origin, setOrigin] = useState('JNB');
  const [destination, setDestination] = useState('CPT');

  const handleLaunch = () => {
    const payload = {
      aircraft,
      pilot,
      origin,
      destination,
      departureTime: new Date().toISOString(),
    };
    onLaunch(payload);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">🛫 Flight Planner</h3>
      <input type="text" placeholder="Aircraft ID" value={aircraft} onChange={e => setAircraft(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <input type="text" placeholder="Pilot Name" value={pilot} onChange={e => setPilot(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <button onClick={handleLaunch} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Initiate Flight</button>
    </div>
  );
}