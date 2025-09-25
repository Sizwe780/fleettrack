import React from 'react';

export default function TripDelayExplainer({ trip }) {
  const delayEvents = [];

  if (trip.idleAlerts?.length > 0) {
    trip.idleAlerts.forEach((a) => {
      delayEvents.push({
        label: `Idle at ${a.location}`,
        time: a.flaggedAt,
        impact: `${a.duration} min`
      });
    });
  }

  if (trip.incidents?.length > 0) {
    trip.incidents.forEach((i) => {
      delayEvents.push({
        label: `Incident: ${i.type}`,
        time: i.time,
        impact: i.impact || '—'
      });
    });
  }

  if (trip.analysis?.delayRisk > 6) {
    delayEvents.push({
      label: `High Delay Risk`,
      time: trip.endTime,
      impact: `Score: ${trip.analysis.delayRisk}`
    });
  }

  const sorted = delayEvents.sort((a, b) => new Date(a.time) - new Date(b.time));

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">⏳ Trip Delay Explainer</h2>
      {sorted.length > 0 ? (
        <ul className="list-disc pl-5 text-sm">
          {sorted.map((e, i) => (
            <li key={i}>
              <strong>{e.label}</strong> — {new Date(e.time).toLocaleString()} | Impact: {e.impact}
            </li>
          ))}
        </ul>
      ) : (
        <p>No delay events recorded for this trip.</p>
      )}
    </div>
  );
}