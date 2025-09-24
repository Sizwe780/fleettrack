import React from 'react';

export default function TripExportModule({ trip }) {
  const handleExport = () => {
    const payload = {
      origin: trip.origin,
      destination: trip.destination,
      driver: trip.driver_name,
      status: trip.status,
      profit: trip.analysis?.profitability?.revenue,
      fuelUsed: trip.analysis?.ifta?.fuelUsed,
      slaBreached: trip.slaBreached,
      flagReason: trip.flagReason,
    };
    console.log('Exporting trip:', payload);
    alert('Trip exported (simulated)');
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
      >
        📤 Export Trip Summary
      </button>
    </div>
  );
}