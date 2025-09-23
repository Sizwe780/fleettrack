import React, { useState } from 'react';

const TripStatusManager = ({ trip, onStatusUpdate }) => {
  const [status, setStatus] = useState(trip.status ?? 'pending');

  const statuses = ['pending', 'active', 'completed', 'flagged'];

  const handleChange = (newStatus) => {
    setStatus(newStatus);
    onStatusUpdate?.(trip.id, newStatus);

    // Optional: push to statusHistory if trip object is mutable
    if (trip.statusHistory) {
      trip.statusHistory.push({
        status: newStatus,
        timestamp: Date.now(),
        actor: trip.driver_uid ?? 'system',
      });
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <label className="block text-sm font-medium text-gray-700">Trip Status</label>
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs">
        <summary className="cursor-pointer font-semibold text-gray-700">🛠️ Status Debug</summary>
        <pre className="overflow-x-auto mt-1">{JSON.stringify({ current: status, history: trip.statusHistory }, null, 2)}</pre>
      </details>
    </div>
  );
};

export default TripStatusManager;