import React from 'react';
import TripLogsheet from './TripLogsheet';
import ExportButton from './ExportButton';
import TriplogsheetGenerator from './TriplogsheetGenerator';

const EldLogVisualizer = ({ trip }) => {
  const logs = TriplogsheetGenerator(trip); // ✅ normalized logsheets

  if (logs.length === 0) {
    return <p className="text-sm text-gray-500">No logsheets available for this trip.</p>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold mb-4">📋 Daily Logsheets</h2>
      {logs.map((log, index) => (
        <div key={index} className="border rounded-xl p-4 bg-gray-50 shadow-sm" id={`logsheet-${index}`}>
          <TripLogsheet log={log} />
          <ExportButton
            targetId={`logsheet-${index}`}
            filename={`FleetTrack_Logsheet_${trip.id}_Day${index + 1}.pdf`}
          />
        </div>
      ))}
    </div>
  );
};

export default EldLogVisualizer;