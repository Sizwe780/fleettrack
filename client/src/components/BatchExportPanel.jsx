import React from 'react';

export default function BatchExportPanel({ trips }) {
  const handleExport = () => {
    const exportPayload = trips.map(t => ({
      id: t.id,
      origin: t.origin,
      destination: t.destination,
      logs: t.analysis?.dailyLogs ?? [],
      profit: t.analysis?.profitability?.netProfit ?? 0,
      flagged: t.status === 'critical'
    }));
    console.log('Exporting batch:', exportPayload);
    alert(`Exported ${exportPayload.length} trips`);
  };

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2">📦 Batch Export Panel</h3>
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
      >
        Export All Trips
      </button>
    </div>
  );
}