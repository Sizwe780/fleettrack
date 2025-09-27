import React from 'react';

export default function MobileCommandApp({ trip }) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-navy mb-2">📱 Mobile Command Console</h3>
      <p className="text-sm text-gray-700 mb-2">Trip: {trip.origin} → {trip.destination}</p>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        Voice Command: “Pause Trip”
      </button>
      <button className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Override: Reroute
      </button>
    </section>
  );
}