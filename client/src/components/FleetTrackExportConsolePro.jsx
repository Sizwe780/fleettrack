import React, { useState } from 'react';
import TripExportToolbar from './TripExportToolbar';
import FleetTrackExportManager from './FleetTrackExportManager';

export default function FleetTrackExportConsolePro({ trips }) {
  const [filter, setFilter] = useState('all');
  const [selectedTripId, setSelectedTripId] = useState('');

  const filteredTrips = trips.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'flagged') return t.status === 'critical';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const selectedTrip = filteredTrips.find((t) => t.id === selectedTripId) ?? null;

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md space-y-6">
      <h1 className="text-2xl font-bold">📁 FleetTrack Export Console Pro</h1>

      {/* 🔍 Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Filter Trips:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="flagged">Flagged Only</option>
          <option value="completed">Completed Only</option>
        </select>
      </div>

      {/* 📋 Trip Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Trip for PDF Export:</label>
        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full"
        >
          <option value="">— Select a Trip —</option>
          {filteredTrips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.date} • {t.origin} → {t.destination}
            </option>
          ))}
        </select>
      </div>

      {/* 📤 Export Manager */}
      <FleetTrackExportManager trips={filteredTrips} singleTrip={selectedTrip} />

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Export Console Debug</summary>
        <pre className="overflow-x-auto mt-2">
{JSON.stringify({ filter, selectedTripId, filteredCount: filteredTrips.length }, null, 2)}
        </pre>
      </details>
    </div>
  );
}