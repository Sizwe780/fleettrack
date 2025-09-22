import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import TripMap from './TripMap';
import KPIBadge from './KPIBadge';

const TripDashboard = ({ trip, onSelect, isSelected, onComplete }) => {
  if (!trip) return null;

  const {
    origin = 'Unknown Origin',
    destination = 'Unknown Destination',
    date = 'Unknown Date',
    driver_name = 'Unassigned',
    analysis = {},
    coordinates = [],
    healthScore = null,
    status = 'pending'
  } = trip;

  const revenue = analysis?.profitability?.revenue ?? 0;
  const profit = analysis?.profitability?.netProfit ?? 0;
  const distance = analysis?.profitability?.distanceMiles ?? 0;
  const fuelUsed = analysis?.ifta?.fuelUsed ?? 0;

  const formattedDate = new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const getHealthColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusBadge = () => {
    let label = status.charAt(0).toUpperCase() + status.slice(1);
    let color = 'bg-gray-200 text-gray-700';

    if (status === 'completed') color = 'bg-green-100 text-green-700';
    else if (status === 'flagged') color = 'bg-yellow-100 text-yellow-700';
    else if (status === 'critical' || healthScore < 50) {
      label = 'Critical';
      color = 'bg-red-100 text-red-700';
    }

    return (
      <span className={`inline-block px-2 py-1 text-xs rounded ${color}`}>
        {label}
      </span>
    );
  };

  return (
    <div
      className={`bg-white p-4 rounded-xl shadow-md border transition ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold">
          {origin} → {destination}
        </h3>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            onClick={onSelect}
            className={`px-3 py-1 text-sm rounded ${
              isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {isSelected ? 'Selected' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Health Score Badge */}
      {healthScore !== null && (
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 text-xs rounded ${getHealthColor(healthScore)}`}>
            Health Score: {healthScore}/100
          </span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <KPIBadge label="Distance" value={`${distance} mi`} status="good" />
        <KPIBadge label="Fuel Used" value={`${fuelUsed} L`} status="warn" />
        <KPIBadge label="Profit" value={`R${profit.toFixed(2)}`} status="good" />
        <KPIBadge label="Revenue" value={`R${revenue.toFixed(2)}`} status="neutral" />
      </div>

      {/* Metadata */}
      <p className="text-gray-600 mb-1 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        {formattedDate}
      </p>
      <p className="text-gray-600 mb-1 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Driver: {driver_name}
      </p>

      {/* Map Preview */}
      <TripMap routeData={{ coordinates, driver: driver_name, origin, destination, distance }} />

      {/* Complete Trip Button */}
      <div className="mt-4">
        <button
          onClick={() => onComplete(trip)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Complete Trip
        </button>
      </div>
    </div>
  );
};

export default TripDashboard;