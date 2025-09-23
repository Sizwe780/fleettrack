import React from 'react';

export default function FleetTrackExportAnalytics({ history = [] }) {
  if (!Array.isArray(history) || history.length === 0) {
    return <p>No export data available.</p>;
  }

  const formatCounts = history.reduce((acc, entry) => {
    acc[entry.format] = (acc[entry.format] || 0) + 1;
    return acc;
  }, {});

  const tripCounts = history.reduce((acc, entry) => {
    acc[entry.tripId] = (acc[entry.tripId] || 0) + 1;
    return acc;
  }, {});

  const topTrips = Object.entries(tripCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md text-sm space-y-6">
      <h2 className="text-xl font-bold">📈 Export Analytics</h2>

      {/* Format Usage */}
      <div>
        <h3 className="text-lg font-semibold">📁 Format Usage</h3>
        <ul className="list-disc ml-5">
          {Object.entries(formatCounts).map(([format, count]) => (
            <li key={format}>
              {format.toUpperCase()}: {count} exports
            </li>
          ))}
        </ul>
      </div>

      {/* Top Exported Trips */}
      <div>
        <h3 className="text-lg font-semibold">🚚 Top Exported Trips</h3>
        <ul className="list-disc ml-5">
          {topTrips.map(([tripId, count]) => (
            <li key={tripId}>
              Trip <code>{tripId}</code>: {count} exports
            </li>
          ))}
        </ul>
      </div>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Export Analytics Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify({ formatCounts, tripCounts }, null, 2)}</pre>
      </details>
    </div>
  );
}