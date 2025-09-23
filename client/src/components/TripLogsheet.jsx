import React from 'react';

export default function TripLogsheet({ trip }) {
  if (!trip) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🧾 Trip Logsheet</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><strong>Driver:</strong> {trip.driver_name}</div>
        <div><strong>Date:</strong> {new Date(trip.date).toLocaleDateString()}</div>
        <div><strong>Origin:</strong> {trip.origin}</div>
        <div><strong>Destination:</strong> {trip.destination}</div>
        <div><strong>Cycle Used:</strong> {trip.cycle_used} hrs</div>
        <div><strong>Departure Time:</strong> {trip.departure_time}</div>
        <div><strong>Health Score:</strong> {trip.healthScore}/100</div>
        <div><strong>Status:</strong> {trip.status}</div>
      </div>

      <div className="mt-4">
        <strong>Remarks:</strong>
        <ul className="list-disc ml-6 text-sm mt-2">
          {(trip.remarks || []).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-gray-500">Driver Signature:</p>
        <div className="h-16 border-b border-gray-400 w-64 mt-2" />
      </div>
    </div>
  );
}