import React, { useState } from 'react';

export default function TripStartForm({ onStart }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverName, setDriverName] = useState('');

  const handleSubmit = () => {
    const payload = {
      origin,
      destination,
      vehicleId,
      driverName,
      departureTime: new Date().toISOString(),
    };
    onStart(payload);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">📝 Log New Trip</h3>
      <input type="text" placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <input type="text" placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <input type="text" placeholder="Vehicle ID" value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <input type="text" placeholder="Driver Name" value={driverName} onChange={e => setDriverName(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Start Trip</button>
      <button className="px-4 py-2 bg-platinum text-darkBlue rounded hover:bg-emerald"></button>
    Start Trip

    </div>
  );
}