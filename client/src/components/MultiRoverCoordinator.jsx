import React, { useState } from 'react';

export default function MultiRoverCoordinator({ onUpdate }) {
  const [rovers, setRovers] = useState([
    { id: 'R-01', terrain: 'Rocky', task: 'Sample collection' },
    { id: 'R-02', terrain: 'Sandy', task: 'Navigation test' },
  ]);

  return (
    <div className="mt-4 p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">🛸 Rover Coordination</h4>
      <ul className="space-y-1">
        {rovers.map((r, i) => (
          <li key={i}>🛰️ {r.id} — {r.terrain} — Task: {r.task}</li>
        ))}
      </ul>
    </div>
  );
}