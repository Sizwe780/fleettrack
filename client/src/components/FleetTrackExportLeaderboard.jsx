import React from 'react';

export default function FleetTrackExportLeaderboard({ history = [] }) {
  if (!Array.isArray(history) || history.length === 0) {
    return <p>No export data available.</p>;
  }

  const tripCounts = {};
  const driverCounts = {};
  const formatCounts = {};

  history.forEach(({ tripId, actor, format }) => {
    tripCounts[tripId] = (tripCounts[tripId] || 0) + 1;
    driverCounts[actor] = (driverCounts[actor] || 0) + 1;
    formatCounts[format] = (formatCounts[format] || 0) + 1;
  });

  const top = (obj) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md text-sm space-y-6">
      <h2 className="text-xl font-bold">🏆 Export Leaderboard</h2>

      {/* Top Trips */}
      <div>
        <h3 className="text-lg font-semibold">🚚 Most Exported Trips</h3>
        <ul className="list-disc ml-5">
          {top(tripCounts).map(([tripId, count]) => (
            <li key={tripId}>
              Trip <code>{tripId}</code>: {count} exports
            </li>
          ))}
        </ul>
      </div>

      {/* Top Drivers */}
      <div>
        <h3 className="text-lg font-semibold">👤 Top Exporting Drivers</h3>
        <ul className="list-disc ml-5">
          {top(driverCounts).map(([driver, count]) => (
            <li key={driver}>
              {driver}: {count} exports
            </li>
          ))}
        </ul>
      </div>

      {/* Format Popularity */}
      <div>
        <h3 className="text-lg font-semibold">📁 Format Popularity</h3>
        <ul className="list-disc ml-5">
          {top(formatCounts).map(([format, count]) => (
            <li key={format}>
              {format.toUpperCase()}: {count} exports
            </li>
          ))}
        </ul>
      </div>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Leaderboard Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify({ tripCounts, driverCounts, formatCounts }, null, 2)}</pre>
      </details>
    </div>
  );
}