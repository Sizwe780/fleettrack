import React from 'react';
import TripMap from './TripMap';
import TripReplayWithStops from './TripReplayWithStops';
import LogsheetCanvas from './LogsheetCanvas';
import ComplianceSummary from './ComplianceSummary';
import FleetTrackIncidentLog from './FleetTrackIncidentLog';
import FleetTrackExportAuditLog from './FleetTrackExportAuditLog';

export default function FleetTrackReplayConsole({ trip, incidents = [] }) {
  const logs = trip.analysis?.dailyLogs ?? [];
  const routeData = trip.routeData ?? {};
  const hasReplay = Array.isArray(trip.coordinates) && trip.coordinates.length > 0;

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md space-y-6">
      <h1 className="text-2xl font-bold">🛰️ FleetTrack Replay Console</h1>

      {/* 🗺️ Trip Path */}
      <div>
        <h2 className="text-lg font-semibold mb-2">🗺️ Trip Path & Stops</h2>
        <TripMap
          origin={trip.origin}
          destination={trip.destination}
          routeData={routeData}
        />
      </div>

      {/* ▶️ Replay */}
      {hasReplay && (
        <div>
          <h2 className="text-lg font-semibold mb-2">▶️ Trip Replay</h2>
          <TripReplayWithStops trip={trip} />
        </div>
      )}

      {/* 📋 Logsheets */}
      <div>
        <h2 className="text-lg font-semibold mb-2">📋 Daily Logsheet</h2>
        <LogsheetCanvas logs={logs} />
      </div>

      {/* 🚦 Compliance */}
      <div>
        <h2 className="text-lg font-semibold mb-2">🚦 Compliance Summary</h2>
        <ComplianceSummary trip={trip} />
      </div>

      {/* 🚨 Incidents */}
      <div>
        <h2 className="text-lg font-semibold mb-2">🚨 Reported Incidents</h2>
        <FleetTrackIncidentLog incidents={incidents} />
      </div>

      {/* 📜 Audit Trail */}
      <div>
        <h2 className="text-lg font-semibold mb-2">📜 Status History</h2>
        <FleetTrackExportAuditLog trip={trip} />
      </div>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Replay Console Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(trip, null, 2)}</pre>
      </details>
    </div>
  );
}