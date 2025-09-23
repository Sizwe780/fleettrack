import React, { useState } from 'react';
import ExportButton from './ExportButton';
import DownloadCSVButton from './DownloadCSVButton';

export default function FleetTrackExportQueue({ trips }) {
  const [statusMap, setStatusMap] = useState({});

  const handleExportPDF = (trip) => {
    const id = trip.id;
    setStatusMap((prev) => ({ ...prev, [id]: 'exporting' }));

    setTimeout(() => {
      setStatusMap((prev) => ({ ...prev, [id]: 'completed' }));
    }, 1500); // Simulate export delay
  };

  const handleExportCSV = () => {
    setStatusMap((prev) => ({ ...prev, batch: 'exporting' }));

    setTimeout(() => {
      setStatusMap((prev) => ({ ...prev, batch: 'completed' }));
    }, 1000);
  };

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md space-y-6">
      <h1 className="text-2xl font-bold">📦 FleetTrack Export Queue</h1>

      {/* 🔁 Batch CSV Export */}
      <div className="flex items-center space-x-4">
        <DownloadCSVButton trips={trips} />
        {statusMap.batch && (
          <span className="text-sm text-gray-600">
            Status: {statusMap.batch}
          </span>
        )}
        <button
          onClick={handleExportCSV}
          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
        >
          Simulate CSV Export
        </button>
      </div>

      {/* 📤 Individual PDF Exports */}
      <div className="space-y-4">
        {trips.map((trip) => (
          <div key={trip.id} className="border p-3 rounded-md bg-gray-50">
            <p className="text-sm font-medium">
              {trip.date} • {trip.origin} → {trip.destination}
            </p>
            <div className="flex items-center space-x-3 mt-2">
              <ExportButton
                targetId={`export-bundle-${trip.id}`}
                filename={`FleetTrack_TripExport_${trip.id}.pdf`}
              />
              <button
                onClick={() => handleExportPDF(trip)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Simulate PDF Export
              </button>
              {statusMap[trip.id] && (
                <span className="text-sm text-gray-600">
                  Status: {statusMap[trip.id]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Export Queue Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(statusMap, null, 2)}</pre>
      </details>
    </div>
  );
}