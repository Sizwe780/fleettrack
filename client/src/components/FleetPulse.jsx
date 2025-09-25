import React from 'react';

export default function FleetPulse({ fleet }) {
  const now = Date.now();
  const staleThreshold = 1000 * 60 * 30; // 30 minutes

  const offline = fleet.filter(t => !t.liveLocation);
  const stale = fleet.filter(t => {
    const updated = new Date(t.updatedAt || t.endTime || 0).getTime();
    return now - updated > staleThreshold;
  });

  const idle = fleet.filter(t => t.dispatchStatus === 'planned');
  const active = fleet.filter(t => t.dispatchStatus === 'in-progress');
  const completed = fleet.filter(t => t.dispatchStatus === 'completed');

  const readinessScore = Math.round(
    ((active.length + completed.length) / fleet.length) * 100
  );

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">💓 Fleet Pulse</h2>
      <p><strong>Fleet Size:</strong> {fleet.length}</p>
      <p><strong>Offline Vehicles:</strong> {offline.length}</p>
      <p><strong>Stale Logsheets:</strong> {stale.length}</p>
      <p><strong>Idle Trips:</strong> {idle.length}</p>
      <p><strong>Active Trips:</strong> {active.length}</p>
      <p><strong>Completed Trips:</strong> {completed.length}</p>
      <p><strong>Readiness Score:</strong> {readinessScore}%</p>
    </div>
  );
}