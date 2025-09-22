// src/components/TripInsights.js
import React from 'react';
import Map, { Marker } from 'react-map-gl';
import { Fuel, Bed } from 'lucide-react';

const TripInsights = ({ trip, onClose }) => {
  const { route, fuel_stops, rest_stops, profitability, driver_logs, remarks, ifta } = trip.analysis;

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Trip Insights</h2>
        <button onClick={onClose} className="text-red-500 font-semibold">Close</button>
      </div>

      <Map
        initialViewState={{
          longitude: route.origin.coordinates[0],
          latitude: route.origin.coordinates[1],
          zoom: 6
        }}
        style={{ width: '100%', height: 400 }}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        {fuel_stops.map((stop, i) => (
          <Marker key={`fuel-${i}`} longitude={stop.coordinates[0]} latitude={stop.coordinates[1]}>
            <Fuel className="text-yellow-600" />
          </Marker>
        ))}
        {rest_stops.map((stop, i) => (
          <Marker key={`rest-${i}`} longitude={stop.coordinates[0]} latitude={stop.coordinates[1]}>
            <Bed className="text-blue-600" />
          </Marker>
        ))}
      </Map>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Profitability</h3>
          <p>Revenue: R{profitability.revenue.toFixed(2)}</p>
          <p>Fuel Cost: R{profitability.fuelCost.toFixed(2)}</p>
          <p>Other Costs: R{profitability.otherCosts.toFixed(2)}</p>
          <p className="font-bold">Profit: R{profitability.profit.toFixed(2)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">IFTA Summary</h3>
          <p>Estimated Tax: {ifta.estimatedTax}</p>
          {ifta.milesByState.map((entry, i) => (
            <p key={i}>{entry.state}: {entry.miles.toFixed(1)} mi</p>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">Driver Log Sheet</h3>
        {driver_logs.map((log, i) => (
          <p key={i}>{log.status}: {log.start_time} → {log.end_time}</p>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">Compliance Notes</h3>
        <ul className="list-disc pl-6">
          {remarks.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default TripInsights;