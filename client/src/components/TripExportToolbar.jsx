import React, { useState } from 'react';
import FleetTrackExportManager from './FleetTrackExportManager';

export default function TripExportToolbar({ trips }) {
  const [selectedTripId, setSelectedTripId] = useState('');
  const selectedTrip = trips.find(t => t.id === selectedTripId) ?? null;

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md space-y-6">
      <h2 className="text-xl font-bold">📦 Trip Export Toolbar</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">Select Trip for PDF Export:</label>
        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full"
        >
          <option value="">— Select a Trip —</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.date} • {t.origin} → {t.destination}
            </option>
          ))}
        </select>
      </div>

      <FleetTrackExportManager trips={trips} singleTrip={selectedTrip} />
    </div>
  );
}