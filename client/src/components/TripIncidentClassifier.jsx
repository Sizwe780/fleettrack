import React from 'react';

export default function TripIncidentClassifier({ trip }) {
  const grouped = {};

  trip.incidents?.forEach(i => {
    const type = i.type || 'Unknown';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(i);
  });

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🧠 Incident Classifier</h2>
      {Object.entries(grouped).map(([type, list], i) => (
        <div key={i} className="mb-4">
          <h3 className="font-semibold">{type}</h3>
          <ul className="list-disc pl-5 text-sm">
            {list.map((i, j) => (
              <li key={j}>{i.severity || 'Medium'} — {new Date(i.time).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}