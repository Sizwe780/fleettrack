import React, { useState } from 'react';

export default function MultiLegMissionPlanner({ onPlan }) {
  const [legs, setLegs] = useState([
    { origin: 'Earth', destination: 'Mars Orbit' },
    { origin: 'Mars Orbit', destination: 'Mars Surface' },
    { origin: 'Mars Surface', destination: 'Earth' },
  ]);

  const handlePlan = () => {
    const payload = legs.map((leg, i) => ({
      ...leg,
      legId: `leg-${i + 1}`,
      plannedTime: new Date().toISOString(),
    }));
    onPlan(payload);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">🧾 Multi-Leg Mission Planner</h3>
      {legs.map((leg, i) => (
        <div key={i} className="mb-2 text-sm">
          <p>Leg {i + 1}: {leg.origin} → {leg.destination}</p>
        </div>
      ))}
      <button onClick={handlePlan} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        Plan Mission
      </button>
    </div>
  );
}