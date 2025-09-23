import React from 'react';

export default function TripViewerExportButtons({ trip, tripId }) {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(trip, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-${tripId}.json`;
    a.click();
  };

  const exportCSV = () => {
    const rows = [
      ['Field', 'Value'],
      ...Object.entries(trip).map(([key, value]) => [key, JSON.stringify(value)])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-${tripId}.csv`;
    a.click();
  };

  return (
    <div className="flex gap-4 mt-4">
      <button onClick={exportJSON} className="px-4 py-2 bg-green-600 text-white rounded-md">Export JSON</button>
      <button onClick={exportCSV} className="px-4 py-2 bg-blue-600 text-white rounded-md">Export CSV</button>
      <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-md">Print Logsheet</button>
    </div>
  );
}