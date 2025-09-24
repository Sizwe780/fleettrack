import React, { useState } from 'react';

export default function MissionPlanner({ onLaunch }) {
  const [origin, setOrigin] = useState('Earth');
  const [destination, setDestination] = useState('Mars');
  const [vehicle, setVehicle] = useState('');
  const [commander, setCommander] = useState('');

  const handleLaunch = () => {
    const payload = {
      origin,
      destination,
      vehicle,
      commander,
      launchTime: new Date().toISOString(),
    };
    onLaunch(payload);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">🚀 Mission Planner</h3>
      <input type="text" placeholder="Vehicle ID" value={vehicle} onChange={e => setVehicle(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <input type="text" placeholder="Commander Name" value={commander} onChange={e => setCommander(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <button onClick={handleLaunch} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Initiate Launch</button>
    </div>
  );
}