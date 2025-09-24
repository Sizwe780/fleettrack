import React from 'react';

export default function ManagerOverridePanel({ trip, onOverride }) {
  return (
    <div className="mt-4 bg-yellow-50 p-3 rounded text-sm">
      <h4 className="font-semibold mb-2">🧭 Manager Override</h4>
      <button
        onClick={() => onOverride(trip.id, 'completed')}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Mark as Completed
      </button>
      <button
        onClick={() => onOverride(trip.id, 'critical')}
        className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Flag as Critical
      </button>
    </div>
  );
}