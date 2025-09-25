import React from 'react';

export default function FleetOpsSignalPanel({ trips }) {
  const now = Date.now();
  const staleThreshold = 1000 * 60 * 10; // 10 minutes

  const signals = trips.map(t => {
    const updated = new Date(t.updatedAt || t.endTime || 0).getTime();
    const age = now - updated;
    const status = age > staleThreshold ? 'Weak' : 'Strong';
    return {
      tripId: t.tripId,
      driver: t.driverName,
      vehicle: t.vehicleId,
      status
    };
  });

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📶 Fleet Ops Signal Panel</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Trip</th><th>Driver</th><th>Vehicle</th><th>Signal</th></tr></thead>
        <tbody>
          {signals.map((s, i) => (
            <tr key={i}>
              <td>{s.tripId}</td>
              <td>{s.driver}</td>
              <td>{s.vehicle}</td>
              <td style={{ color: s.status === 'Weak' ? '#d00' : '#28a745' }}>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}