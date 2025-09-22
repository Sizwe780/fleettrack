import React from 'react';
import TripInsights from './TripInsights';
import TripMap from './TripMap';
import TripFeedback from './TripFeedback';
import useUserRole from '../hooks/useUserRole';
import { exportTripToPDF } from '../utils/exportTripData';
import AdminControls from './AdminControls';

const TripDashboard = ({ trip }) => {
  if (!trip) return <p>No trip data available.</p>;

  const {
    origin,
    destination,
    cycleUsed,
    driver_name,
    date,
    routeData,
    analysis,
  } = trip;

  const profit = analysis?.profitability?.netProfit ?? 0;
  const fuelUsed = analysis?.ifta?.fuelUsed ?? 0;
  const distance = routeData?.distance ?? 0;
  const costs = analysis?.profitability?.costs ?? {};
  const remarks = analysis?.remarks ?? '';

  const fuelEfficiency =
    distance && fuelUsed
      ? `${(fuelUsed / distance * 100).toFixed(2)} L/100km`
      : 'N/A';

  const role = useUserRole();

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-md border">
      {/* Trip Summary */}
      <div className="text-xl font-semibold">
        🚚 {origin} → {destination}
      </div>
      <div className="text-sm text-gray-600">
        Driver: {driver_name} | Date: {date} | Cycle Time: {cycleUsed} hrs
      </div>

      {/* Profit & Fuel */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-green-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">💰 Profit</h3>
          <p className="text-2xl text-green-700">R{profit}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">⛽ Fuel Efficiency</h3>
          <p className="text-2xl text-blue-700">{fuelEfficiency}</p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">📊 Cost Breakdown</h3>
        <ul className="list-disc list-inside text-gray-700">
          {Object.entries(costs).map(([key, value]) => (
            <li key={key}>
              {key}: R{value}
            </li>
          ))}
        </ul>
      </div>

      {/* Route Stats */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">🧭 Route Stats</h3>
        <p>Distance: {distance} km</p>
        <p>Average Speed: {routeData?.avgSpeed ?? 'N/A'} km/h</p>
      </div>

      {/* Remarks */}
      {remarks && (
        <div className="mt-6 bg-yellow-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">⚠️ Remarks</h3>
          <p>{remarks}</p>
        </div>
      )}

      {/* Predictive Insights */}
      <TripInsights trip={trip} />

      {/* Route Map */}
      <TripMap routeData={routeData} />

      {/* Feedback Form */}
      <TripFeedback tripId={trip.id} />

      {/* Export Button */}
      <div className="mt-4">
        <button
          onClick={() => exportTripToPDF(trip)}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
        >
          📄 Export Trip Summary (PDF)
        </button>
      </div>

      {/* KPI Alerts */}
      <div className="mt-4 space-y-2">
        {fuelEfficiency !== 'N/A' && parseFloat(fuelEfficiency) > 15 && (
          <div className="text-red-600 font-bold">⚠️ High Fuel Usage</div>
        )}
        {profit > 10000 && (
          <div className="text-green-600 font-bold">✅ High Profit Margin</div>
        )}
      </div>

      {/* Admin Controls */}
      {role === 'admin' && <AdminControls trip={trip} />}
    </div>
  );
};

export default TripDashboard;