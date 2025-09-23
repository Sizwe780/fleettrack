import React from 'react';

export default function FleetTrackExportReport({ history = [] }) {
  if (!Array.isArray(history) || history.length === 0) {
    return <p>No export data available for this period.</p>;
  }

  const totalExports = history.length;
  const formatCounts = history.reduce((acc, entry) => {
    acc[entry.format] = (acc[entry.format] || 0) + 1;
    return acc;
  }, {});

  const tripCounts = history.reduce((acc, entry) => {
    acc[entry.tripId] = (acc[entry.tripId] || 0) + 1;
    return acc;
  }, {});

  const topTrip = Object.entries(tripCounts).sort((a, b) => b[1] - a[1])[0];
  const startDate = new Date(history[0].timestamp).toLocaleDateString();
  const endDate = new Date(history[history.length - 1].timestamp).toLocaleDateString();

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md text-sm space-y-6">
      <h2 className="text-xl font-bold">🗓️ FleetTrack Monthly Export Report</h2>

      {/* Summary */}
      <div>
        <p><strong>Reporting Period:</strong> {startDate} → {endDate}</p>
        <p><strong>Total Exports:</strong> {totalExports}</p>
        <p><strong>PDF Exports:</strong> {formatCounts.pdf ?? 0}</p>
        <p><strong>CSV Exports:</strong> {formatCounts.csv ?? 0}</p>
      </div>

      {/* Top Trip */}
      {topTrip && (
        <div>
          <h3 className="text-lg font-semibold mt-4">🚚 Most Exported Trip</h3>
          <p>Trip <code>{topTrip[0]}</code> was exported {topTrip[1]} times.</p>
        </div>
      )}

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Export Report Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify({ formatCounts, tripCounts }, null, 2)}</pre>
      </details>
    </div>
  );
}