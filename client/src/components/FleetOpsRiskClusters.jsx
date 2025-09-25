import React from 'react';

export default function FleetOpsRiskClusters({ trips }) {
  const clusters = trips
    .filter(t => t.analysis?.delayRisk > 7 || t.analysis?.fatigueRisk > 7)
    .map(t => ({
      tripId: t.tripId,
      region: `${t.origin} → ${t.destination}`,
      delay: t.analysis?.delayRisk,
      fatigue: t.analysis?.fatigueRisk
    }));

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🚨 Fleet Risk Clusters</h2>
      <ul className="list-disc pl-5 text-sm">
        {clusters.map((c, i) => (
          <li key={i}>
            <strong>{c.tripId}</strong> — {c.region} | Delay: {c.delay} | Fatigue: {c.fatigue}
          </li>
        ))}
      </ul>
    </div>
  );
}