import React from 'react';

export default function TripExportPreview({ trip }) {
  if (!trip) return null;

  const { origin, destination, driver_name, analysis, status, createdAt } = trip;
  const fuelUsed = analysis?.ifta?.fuelUsed ?? '—';
  const profit = analysis?.profitability?.netProfit ?? '—';
  const healthScore = analysis?.healthScore ?? trip.healthScore ?? '—';

  return (
    <div className="mt-6 border rounded p-4 bg-gray-50 text-sm">
      <h4 className="font-semibold mb-2">🧾 Export Preview</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="font-semibold">Origin</p>
          <p>{origin}</p>
        </div>
        <div>
          <p className="font-semibold">Destination</p>
          <p>{destination}</p>
        </div>
        <div>
          <p className="font-semibold">Driver</p>
          <p>{driver_name}</p>
        </div>
        <div>
          <p className="font-semibold">Status</p>
          <p>{status}</p>
        </div>
        <div>
          <p className="font-semibold">Created</p>
          <p>{new Date(createdAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="font-semibold">Fuel Used</p>
          <p>{fuelUsed} L</p>
        </div>
        <div>
          <p className="font-semibold">Profit</p>
          <p>R{profit}</p>
        </div>
        <div>
          <p className="font-semibold">Health Score</p>
          <p>{healthScore}/100</p>
        </div>
      </div>
    </div>
  );
}