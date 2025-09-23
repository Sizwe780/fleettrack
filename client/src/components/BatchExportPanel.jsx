import React from 'react';

export default function BatchExportPanel({ trips }) {
  const handleExport = () => {
    const exportPayload = trips.map(t => ({
      id: t.id,
      origin: t.origin,
      destination: t.destination,
      departureTime: t.departureTime ?? '—',
      healthScore: t.analysis?.healthScore ?? t.healthScore ?? 0,
      profit: t.analysis?.profitability?.netProfit ?? 0,
      flagged: t.status === 'critical',
      statusHistory: t.statusHistory ?? [],
      logs: (t.analysis?.dailyLogs ?? []).flatMap(log =>
        log.blocks?.map(b => ({
          date: log.date,
          type: b.type,
          start: b.start,
          end: b.end,
          duration: b.durationHours ?? '—',
        })) ?? []
      ),
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

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📤 Export Payload Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(trips, null, 2)}</pre>
      </details>
    </div>
  );
}