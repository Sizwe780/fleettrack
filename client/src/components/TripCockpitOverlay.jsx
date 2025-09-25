import React, { useEffect } from 'react';
import TripProgressTracker from './TripProgressTracker';
import TripIncidentPanel from './TripIncidentPanel';
import TripReroutePanel from './TripReroutePanel';
import { predictDelayRisk } from '../utils/TripDelayPredictor';
import { dispatchTripAlerts } from '../utils/TripAlertDispatcher';

export default function TripCockpitOverlay({ originCoords, destinationCoords, departureTime, slaLimitHours }) {
  const [arrivalTime, setArrivalTime] = React.useState(null);

  useEffect(() => {
    if (!arrivalTime) return;
    const risk = predictDelayRisk({ departureTime, arrivalTime, slaLimitHours });
    dispatchTripAlerts(risk);
  }, [arrivalTime]);

  return (
    <div className="mt-6 space-y-4">
      <TripProgressTracker
        originCoords={originCoords}
        destinationCoords={destinationCoords}
        departureTime={departureTime}
        onETAUpdate={setArrivalTime}
      />
      <TripIncidentPanel
        bbox={`${originCoords.lat - 0.1},${originCoords.lng - 0.1},${destinationCoords.lat + 0.1},${destinationCoords.lng + 0.1}`}
      />
      <TripReroutePanel originCoords={originCoords} destinationCoords={destinationCoords} />
    </div>
  );
}