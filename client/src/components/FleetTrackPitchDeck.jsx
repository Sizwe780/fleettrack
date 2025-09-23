import React from 'react';

export default function FleetTrackPitchDeck({ trip }) {
  if (!trip || !trip.id) return <p>⚠️ No trip data available.</p>;

  const profit = trip.analysis?.profitability ?? {};
  const logs = trip.analysis?.dailyLogs ?? [];
  const violations = logs.filter(
    (b) => b.type === 'driving' && parseFloat(b.durationHours ?? 0) > 4
  );
  const incidents = trip.incidents ?? [];
  const healthScore = trip.analysis?.healthScore ?? 100;

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md space-y-6">
      <h1 className="text-2xl font-bold">📊 FleetTrack Pitch Deck</h1>

      {/* Slide 1: Trip Summary */}
      <section>
        <h2 className="text-lg font-semibold">🧭 Trip Summary</h2>
        <p><strong>Driver:</strong> {trip.driver_name}</p>
        <p><strong>Date:</strong> {trip.date}</p>
        <p><strong>Route:</strong> {trip.origin} → {trip.destination}</p>
        <p><strong>Departure:</strong> {trip.departureTime}</p>
        <p><strong>Status:</strong> {trip.status}</p>
        {trip.flagReason && <p className="text-red-600">⚠️ {trip.flagReason}</p>}
      </section>

      {/* Slide 2: Profitability */}
      <section>
        <h2 className="text-lg font-semibold">💰 Profitability</h2>
        <p><strong>Distance:</strong> {profit.distanceMiles ?? '—'} miles</p>
        <p><strong>Fuel Used:</strong> {profit.fuelUsed ?? '—'} L</p>
        <p><strong>Gross Revenue:</strong> R{profit.grossRevenue ?? '—'}</p>
        <p><strong>Net Profit:</strong> R{profit.netProfit ?? '—'}</p>
        <p><strong>Margin:</strong> {profit.margin ?? '—'}%</p>
      </section>

      {/* Slide 3: Compliance */}
      <section>
        <h2 className="text-lg font-semibold">🚦 Compliance</h2>
        <p><strong>Fleet Health Score:</strong> {healthScore} / 100</p>
        <p><strong>HOS Violations:</strong> {violations.length}</p>
        <p><strong>Incidents:</strong> {incidents.length}</p>
      </section>

      {/* Slide 4: Replay Snapshot */}
      <section>
        <h2 className="text-lg font-semibold">🛰️ Replay Snapshot</h2>
        <p>Trip path, stops, logsheets, and incidents available in replay console.</p>
        <p>Coordinates: {trip.coordinates?.length ?? 0} points</p>
      </section>

      {/* Slide 5: Export Readiness */}
      <section>
        <h2 className="text-lg font-semibold">📤 Export Readiness</h2>
        <p><strong>Audit Trail:</strong> {trip.statusHistory?.length ?? 0} entries</p>
        <p><strong>Export Actions:</strong> PDF and CSV available</p>
        <p><strong>Signature Block:</strong> Included</p>
      </section>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Pitch Deck Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(trip, null, 2)}</pre>
      </details>
    </div>
  );
}