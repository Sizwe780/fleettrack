import React, { useState } from 'react';

const TripStatusManager = ({ trip, onStatusUpdate }) => {
  const [status, setStatus] = useState(trip.status ?? 'pending');

  const statuses = ['pending', 'active', 'completed', 'flagged'];

  const handleChange = (newStatus) => {
    setStatus(newStatus);
    onStatusUpdate?.(trip.id, newStatus);
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Trip Status</label>
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
    </div>
  );
};

export default TripStatusManager;