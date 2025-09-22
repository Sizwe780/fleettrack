import React from 'react';
import { MapPin, DollarSign, Clock } from 'lucide-react';

const TripCard = ({ trip, onClick }) => {
  if (!trip) return null;

  const {
    origin = 'Unknown Origin',
    destination = 'Unknown Destination',
    date = 'Unknown Date',
    driver_name = 'Unassigned',
    analysis = {},
  } = trip;

  const revenue = analysis?.profitability?.revenue ?? 0;
  const distance = analysis?.profitability?.distanceMiles ?? 0;

  // ✅ Format date for readability
  const formattedDate = new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="bg-white p-4 rounded-xl shadow-md border cursor-pointer hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <h3 className="text-xl font-bold mb-2">
        {origin} → {destination}
      </h3>

      <p className="text-gray-600 mb-1 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {distance} mi
      </p>

      <p className="text-gray-600 mb-1 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        {formattedDate}
      </p>

      <p className="text-gray-600 mb-1 flex items-center gap-2">
        <DollarSign className="w-4 h-4" />
        R{revenue.toFixed(2)}
      </p>

      <p className="text-sm text-gray-500 mt-2">Driver: {driver_name}</p>
    </div>
  );
};

export default TripCard;