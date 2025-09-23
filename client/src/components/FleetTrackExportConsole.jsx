import React from 'react';
import ExportButton from './ExportButton';
import LogsheetCanvas from './LogsheetCanvas';
import AuditTrailViewer from './AuditTrailViewer';
import TripInsightsPanel from './TripInsightsPanel';
import TripSignatureBlock from './TripSignatureBlock';

const FleetTrackExportConsole = ({ trip }) => {
  const exportId = `export-bundle-${trip.id}`;
  const logs = trip.analysis?.dailyLogs ?? [];
  const insights = trip.analysis?.insights ?? [];
  const statusHistory = trip.statusHistory ?? [];

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">🧾 Export Console</h2>
      <ExportButton targetId={exportId} filename={`FleetTrack_TripExport_${trip.id}.pdf`} />

      <div id={exportId} className="hidden p-4 text-sm space-y-6">
        <h3 className="text-base font-semibold">📋 Daily Logsheet</h3>
        <LogsheetCanvas logs={logs} />

        <h3 className="text-base font-semibold">📜 Audit Trail</h3>
        <AuditTrailViewer trip={{ statusHistory }} />

        <h3 className="text-base font-semibold">🧠 Strategic Insights</h3>
        <TripInsightsPanel trip={{ analysis: { insights } }} />

        <h3 className="text-base font-semibold">✍️ Signature</h3>
        <TripSignatureBlock driverName={trip.driver_name} />
      </div>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Export Payload Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(trip, null, 2)}</pre>
      </details>
    </div>
  );
};

export default FleetTrackExportConsole;