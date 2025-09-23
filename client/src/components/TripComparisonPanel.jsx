import React from 'react';
import KPIBadge from './KPIBadge';
import TripScoreBadge from './TripScoreBadge';
import scoreTrip from '../utils/tripScorer';

const TripComparisonPanel = ({ selectedTrips = [] }) => {
  if (selectedTrips.length < 2) return null;

  return (
    <div className="mt-6 p-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-xl font-bold mb-4">Trip Comparison</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedTrips.map((trip, index) => {
          const score = scoreTrip(trip);
          const revenue = trip.analysis?.profitability?.revenue ?? 0;
          const profit = trip.analysis?.profitability?.netProfit ?? 0;
          const distance = trip.analysis?.profitability?.distanceMiles ?? 0;
          const fuelUsed = trip.analysis?.ifta?.fuelUsed ?? 0;

          return (
            <div key={trip.id || index} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">
                {trip.origin} → {trip.destination}
              </h3>
              <p className="text-sm text-gray-600 mb-1">Driver: {trip.driver_name}</p>
              <p className="text-sm text-gray-600 mb-1">Date: {trip.date}</p>

              <div className="grid grid-cols-2 gap-4 text-sm my-2">
                <KPIBadge label="Distance" value={`${distance} mi`} status="good" />
                <KPIBadge label="Fuel Used" value={`${fuelUsed} L`} status="warn" />
                <KPIBadge label="Profit" value={`R${profit.toFixed(2)}`} status="good" />
                <KPIBadge label="Revenue" value={`R${revenue.toFixed(2)}`} status="neutral" />
              </div>

              <TripScoreBadge score={score} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripComparisonPanel;