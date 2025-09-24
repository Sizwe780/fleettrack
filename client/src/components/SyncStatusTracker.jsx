import React from 'react';

export default function SyncStatusTracker({ trip }) {
  if (!trip) return null;

  const isOffline = trip.offline === true;
  const syncStatus = trip.syncedAt
    ? `✅ Synced @ ${new Date(trip.syncedAt).toLocaleString()}`
    : isOffline
    ? '📴 Offline trip — not yet synced'
    : '⏳ Sync pending';

  const statusColor = trip.syncedAt ? 'text-green-600' : isOffline ? 'text-red-600' : 'text-yellow-600';

  return (
    <div className={`mt-2 text-sm ${statusColor}`}>
      <strong>Sync Status:</strong> {syncStatus}
    </div>
  );
}