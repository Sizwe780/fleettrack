import React from 'react';

const TripLogsheet = ({ trip }) => {
  if (!trip) return <p className="text-center text-gray-500">No trip data available.</p>;

  const {
    driver_name,
    date,
    origin,
    destination,
    cycle_used,
    vehicleStats,
    remarks,
    departure_time,
    analysis
  } = trip;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto print:max-w-full print:p-0">
      <h2 className="text-2xl font-bold mb-4 text-center">🧾 FleetTrack Trip Logsheet</h2>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div><strong>Driver Name:</strong> {driver_name}</div>
        <div><strong>Date:</strong> {new Date(date).toLocaleDateString()}</div>
        <div><strong>Origin:</strong> {origin}</div>
        <div><strong>Destination:</strong> {destination}</div>
        <div><strong>Cycle Used:</strong> {cycle_used} hrs</div>
        <div><strong>Departure Time:</strong> {departure_time}</div>
        <div><strong>Engine Temp:</strong> {vehicleStats?.engineTemp}°C</div>
        <div><strong>Tire Pressure:</strong> {vehicleStats?.tirePressure} PSI</div>
        <div><strong>Oil Level:</strong> {vehicleStats?.oilLevel}</div>
        <div><strong>Battery Health:</strong> {vehicleStats?.batteryHealth}</div>
        <div><strong>Estimated Profit:</strong> R{analysis?.profitability?.netProfit ?? '—'}</div>
        <div><strong>Health Score:</strong> {trip.healthScore ?? '—'}/100</div>
      </div>

      <div className="mb-6">
        <strong>Remarks:</strong>
        <div className="border p-3 rounded bg-gray-50 text-sm">
          {Array.isArray(remarks)
            ? remarks.map((r, i) => <p key={i}>• {r}</p>)
            : remarks || '—'}
        </div>
      </div>

      <div className="border-t pt-6">
        <p className="text-sm text-gray-500 mb-2">Driver Signature:</p>
        <div className="h-16 border-b border-gray-400 w-64" />
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🖨️ Print Logsheet
        </button>
      </div>
    </div>
  );
};

export default TripLogsheet;