import React from 'react';
import { MapPin, DollarSign, Clock, CheckCircle, Fuel } from 'lucide-react';
import TripMap from './TripMap';
import KPIBadge from './KPIBadge';

const TripDashboard = ({ trip, onSelect, isSelected }) => {
  if (!trip) return null;

  const {
    origin = 'Unknown Origin',
    destination = 'Unknown Destination',
    date = 'Unknown Date',
    driver_name = 'Unassigned',
    analysis = {},
    coordinates = []
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
        <button
          onClick={onSelect}
          className={`px-3 py-1 text-sm rounded ${
            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isSelected ? 'Selected' : 'Compare'}
        </button>
      </div>

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
    </div>
  );
};

export default TripDashboard;