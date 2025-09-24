import React, { useState } from 'react';

export default function DriverHandoff() {
  const [handoffData, setHandoffData] = useState({
    vehicleId: '',
    previousDriver: '',
    nextDriver: '',
    timestamp: new Date().toISOString()
  });

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: POST to /api/handoff
    console.log('Handoff submitted:', handoffData);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">🚚 Driver Handoff</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Vehicle ID"
          value={handoffData.vehicleId}
          onChange={e => setHandoffData({ ...handoffData, vehicleId: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Previous Driver UID"
          value={handoffData.previousDriver}
          onChange={e => setHandoffData({ ...handoffData, previousDriver: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Next Driver UID"
          value={handoffData.nextDriver}
          onChange={e => setHandoffData({ ...handoffData, nextDriver: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Handoff
        </button>
      </form>
    </div>
  );
}