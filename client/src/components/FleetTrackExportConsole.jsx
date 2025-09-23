import React from 'react';
import ExportButton from './ExportButton';

const FleetTrackExportConsole = ({ trip }) => (
  <div className="mt-6">
    <h2 className="text-lg font-bold mb-2">🧾 Export Console</h2>
    <ExportButton
      targetId={`export-bundle-${trip.id}`}
      filename={`FleetTrack_TripExport_${trip.id}.pdf`}
    />
    <div id={`export-bundle-${trip.id}`} className="hidden">
      {/* Include logsheets, audit trail, insights, signature block */}
    </div>
  </div>
);

export default FleetTrackExportConsole;