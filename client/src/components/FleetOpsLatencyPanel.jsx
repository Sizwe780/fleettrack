import React from 'react';

export default function FleetOpsLatencyPanel({ trips }) {
  const now = Date.now();
  const latencyStats = trips.map(t => {
    const updated = new Date(t.updatedAt || t.endTime || 0).getTime();
    const latency = ((now - updated) / 1000 / 60).toFixed(1); // in minutes
    return {
      tripId: t.tripId,
      vehicleId: t.vehicleId,
      latency
    };
  }).sort((a, b) => b.latency - a.latency);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">⏱️ Fleet Ops Latency Panel</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Trip</th><th>Vehicle</th><th>Latency (min)</th></tr></thead>
        <tbody>
          {latencyStats.map((t, i) => (
            <tr key={i}>
              <td>{t.tripId}</td>
              <td>{t.vehicleId}</td>
              <td style={{ color: t.latency > 15 ? '#d00' : '#28a745' }}>{t.latency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}