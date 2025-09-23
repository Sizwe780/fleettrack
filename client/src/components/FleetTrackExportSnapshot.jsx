import React from 'react';
import FleetTrackReplayConsole from './FleetTrackReplayConsole';
import FleetTrackPitchDeck from './FleetTrackPitchDeck';

export default function FleetTrackExportSnapshot({ trip }) {
  if (!trip || !trip.id) return <p>⚠️ No trip data available.</p>;

  const exportId = `export-bundle-${trip.id}`;
  const incidents = trip.incidents ?? [];

  return (
    <div id={exportId} className="print-safe-container">
      {/* 🧭 Trip Summary + Strategic Slides */}
      <FleetTrackPitchDeck trip={trip} />

      {/* 🛰️ Replay Console */}
      <FleetTrackReplayConsole trip={trip} incidents={incidents} />

      {/* ✍️ Signature Block */}
      <div className="mt-10 border-t pt-6 text-sm">
        <p><strong>Driver:</strong> {trip.driver_name}</p>
        <p><strong>Signature:</strong> ____________________________</p>
        <p><strong>Date:</strong> _________________________________</p>
        <p><strong>Exported At:</strong> {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}