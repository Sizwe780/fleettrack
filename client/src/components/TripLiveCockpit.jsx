import React from 'react';
import TripProgressTracker from './TripProgressTracker';
import TripIncidentPanel from './TripIncidentPanel';

export default function TripLiveCockpit({ originCoords, destinationCoords, departureTime }) {
  const bbox = `${originCoords.lat - 0.1},${originCoords.lng - 0.1},${destinationCoords.lat + 0.1},${destinationCoords.lng + 0.1}`;

  return (
    <div className="mt-6">
      <TripProgressTracker
        originCoords={originCoords}
        destinationCoords={destinationCoords}
        departureTime={departureTime}
      />
      <TripIncidentPanel bbox={bbox} />
    </div>
  );
}