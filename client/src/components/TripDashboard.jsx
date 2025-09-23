import React from 'react';
import TripTimeline from './TripTimeline';
import { MapPin, Clock, WifiOff, Route } from 'lucide-react';
import TripMap from './TripMap';
import KPIBadge from './KPIBadge';
import TripScoreBadge from './TripScoreBadge';
import scoreTrip from '../utils/tripScorer';
import MaintenancePredictor from './MaintenancePredictor';
import DriverSentiment from './DriverSentiment';
import TripReplay from './TripReplay';
import DriverBadges from './DriverBadges';

const TripDashboard = ({
  trip,
  onSelect,
  isSelected,
  onComplete,
  isOffline = false,
  routeSuggestion
}) => {
  if (!trip || typeof trip !== 'object') return null;

  const {
    origin = 'Unknown Origin',
    destination = 'Unknown Destination',
    date = 'Unknown Date',
    driver_name = 'Unassigned',
    analysis = {},
    coordinates = [],
    healthScore = null,
    status = 'pending',
    breakTaken = true,
    remarks = [],
    completedAt = null,
    statusHistory = [],
    vehicleStats = {},
    driverStats = {}
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
    else if (status === 'critical' || healthScore < 50 || !breakTaken) {
      label = 'Critical';
      color = 'bg-red-100 text-red-700';
    }

    return (
      <span className={`inline-block px-2 py-1 text-xs rounded ${color}`}>
        {label}
      </span>
    );
  };

  const score = scoreTrip(trip);

  const enrichedDriverStats = {
    totalTrips: driverStats.totalTrips ?? 0,
    violationCount: driverStats.violationCount ?? 0,
    avgHealthScore: driverStats.avgHealthScore ?? healthScore ?? 0,
    avgProfit: driverStats.avgProfit ?? profit ?? 0
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
          {isOffline && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <WifiOff className="w-4 h-4" /> Offline
            </span>
          )}
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

      {/* Route Suggestion */}
      {routeSuggestion && (
        <div className="mb-2 text-sm text-blue-700 flex items-center gap-2">
          <Route className="w-4 h-4" />
          Suggested Route: {routeSuggestion.bestRoute} ({routeSuggestion.avgDuration} hrs avg)
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <KPIBadge label="Distance" value={`${distance} mi`} status="good" />
        <KPIBadge label="Fuel Used" value={`${fuelUsed} L`} status="warn" />
        <KPIBadge label="Profit" value={`R${profit.toFixed(2)}`} status="good" />
        <KPIBadge label="Revenue" value={`R${revenue.toFixed(2)}`} status="neutral" />
      </div>

      {/* Trip Scoring */}
      <div className="mb-4">
        <TripScoreBadge score={score} />
      </div>

      {/* Maintenance Predictor */}
      {vehicleStats && Object.keys(vehicleStats).length > 0 && (
        <div className="mb-4">
          <MaintenancePredictor vehicleStats={vehicleStats} />
        </div>
      )}

      {/* Driver Sentiment */}
      {Array.isArray(remarks) && remarks.length > 0 && (
        <div className="mb-2">
          <DriverSentiment trip={trip} />
        </div>
      )}

      {/* Driver Badges */}
      {enrichedDriverStats.totalTrips > 0 && (
        <div className="mb-2">
          <DriverBadges driverStats={enrichedDriverStats} />
        </div>
      )}

      {/* Trip Replay */}
      {Array.isArray(coordinates) && coordinates.length > 0 &&
       Array.isArray(statusHistory) && statusHistory.length > 0 && (
        <div className="mb-4">
          <TripReplay trip={trip} />
        </div>
      )}

      {/* Trip Timeline */}
      {Array.isArray(statusHistory) && statusHistory.length > 0 && (
        <TripTimeline statusHistory={statusHistory} />
      )}

      {/* Metadata */}
      <p className="text-gray-600 mb-1 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        {formattedDate}
      </p>
      <p className="text-gray-600 mb-1 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Driver: {driver_name}
      </p>

      {/* Completion Timestamp */}
      {status === 'completed' && completedAt && (
        <p className="text-gray-600 mb-1 text-xs">
          Completed on:{' '}
          {new Date(completedAt).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      )}

      {/* Remarks */}
      {Array.isArray(remarks) && remarks.length > 0 && (
        <details className="mb-2 text-sm text-gray-700">
          <summary className="cursor-pointer font-medium">Trip Remarks</summary>
          <ul className="list-disc ml-4 mt-1">
            {remarks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </details>
      )}

      {/* Map Preview */}
      <TripMap
        routeData={{
          coordinates,
          driver: driver_name,
          origin,
          destination,
          distance
        }}
      />

      {/* Complete Trip Button */}
      {status !== 'completed' && (
        <div className="mt-4">
          <button
            onClick={() => onComplete(trip)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Complete Trip
          </button>
        </div>
      )}
    </div>
  );
};

export default TripDashboard;