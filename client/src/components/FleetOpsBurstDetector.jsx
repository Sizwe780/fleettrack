import React from 'react';

export default function FleetOpsBurstDetector({ trips }) {
  const hourly = {};

  trips.forEach(t => {
    const hour = new Date(t.startTime).getHours();
    if (!hourly[hour]) hourly[hour] = { count: 0, breaches: 0, incidents: 0 };
    hourly[hour].count += 1;
    if (t.breachDetected) hourly[hour].breaches += 1;
    if (t.incidents?.length > 0) hourly[hour].incidents += t.incidents.length;
  });

  const spikes = Object.entries(hourly).map(([h, stats]) => ({
    hour: h,
    total: stats.count,
    breaches: stats.breaches,
    incidents: stats.incidents
  })).filter(s => s.breaches > 2 || s.incidents > 3);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">⚡ Fleet Ops Burst Detector</h2>
      {spikes.length > 0 ? (
        <ul className="list-disc pl-5 text-sm">
          {spikes.map((s, i) => (
            <li key={i}>
              Hour {s.hour}: {s.total} trips, {s.breaches} breaches, {s.incidents} incidents
            </li>
          ))}
        </ul>
      ) : (
        <p>✅ No operational bursts detected.</p>
      )}
    </div>
  );
}