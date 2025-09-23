import React, { useState } from 'react';
import ExportButton from './ExportButton';
import DownloadCSVButton from './DownloadCSVButton';

export default function FleetTrackExportManager({ trips, singleTrip = null }) {
  const [mode, setMode] = useState('pdf');

  const handleModeChange = (e) => setMode(e.target.value);

  return (
    <div className="mt-8 border rounded-xl p-4 bg-white shadow-md space-y-4">
      <h2 className="text-lg font-bold">📁 FleetTrack Export Manager</h2>

      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Export Format:</label>
        <select
          value={mode}
          onChange={handleModeChange}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
        </select>
      </div>

      {mode === 'pdf' && singleTrip && (
        <ExportButton
          targetId={`export-bundle-${singleTrip.id}`}
          filename={`FleetTrack_TripExport_${singleTrip.id}.pdf`}
        />
      )}

      {mode === 'csv' && trips?.length > 0 && (
        <DownloadCSVButton
          trips={trips}
          filename={`FleetTrack_Export_${new Date().toISOString().split('T')[0]}.csv`}
        />
      )}

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Export Manager Debug</summary>
        <pre className="overflow-x-auto mt-2">
{JSON.stringify({ mode, tripCount: trips?.length ?? 0, singleTripId: singleTrip?.id ?? null }, null, 2)}
        </pre>
      </details>
    </div>
  );
}