import React, { useState } from 'react';

export default function RoverDispatchModule({ onDispatch }) {
  const [roverId, setRoverId] = useState('');
  const [terrainType, setTerrainType] = useState('Rocky');

  const handleDispatch = () => {
    const payload = {
      roverId,
      terrainType,
      deployedAt: new Date().toISOString(),
    };
    onDispatch(payload);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">🛰️ Rover Deployment</h3>
      <input type="text" placeholder="Rover ID" value={roverId} onChange={e => setRoverId(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <select value={terrainType} onChange={e => setTerrainType(e.target.value)} className="mb-2 p-2 border rounded w-full">
        <option>Rocky</option>
        <option>Sandy</option>
        <option>Crater</option>
        <option>Flat</option>
      </select>
      <button onClick={handleDispatch} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Deploy Rover</button>
    </div>
  );
}