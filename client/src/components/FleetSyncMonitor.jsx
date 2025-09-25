import React from 'react';

export default function FleetSyncMonitor({ trips }) {
  const now = Date.now();
  const staleThreshold = 1000 * 60 * 15; // 15 minutes

  const syncStats = trips.map((trip) => {
    const updated = new Date(trip.updatedAt || trip.endTime || 0).getTime();
    const age = now - updated;
    const isStale = age > staleThreshold;
    return {
      tripId: trip.tripId,
      vehicleId: trip.vehicleId,
      driverName: trip.driverName,
      lastSync: new Date(updated).toLocaleString(),
      status: isStale ? 'Stale' : 'Fresh'
    };
  });

  const sorted = syncStats.sort((a, b) => new Date(b.lastSync) - new Date(a.lastSync));

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📡 Fleet Sync Monitor</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Trip ID</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Last Sync</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={i}>
              <td>{t.tripId}</td>
              <td>{t.vehicleId}</td>
              <td>{t.driverName}</td>
              <td>{t.lastSync}</td>
              <td style={{ color: t.status === 'Stale' ? '#d00' : '#28a745' }}>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}