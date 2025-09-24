import React, { useEffect, useState } from 'react';

export default function DeploymentTimelineDashboard() {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    fetch('/api/deployment-timeline')
      .then(res => res.json())
      .then(data => setTimeline(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">📅 Deployment Timeline</h2>
      <ul className="space-y-4">
        {timeline.map((entry, i) => (
          <li key={i} className="border-l-4 pl-4 border-blue-600">
            <p className="text-sm text-gray-500">{entry.date}</p>
            <h3 className="text-lg font-semibold">{entry.module}</h3>
            <p className="text-gray-700">{entry.description}</p>
            <p className="text-xs text-gray-400">Patch: {entry.patchId} | Status: {entry.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}