import React from 'react';

const MapReplay = ({ points = [] }) => {
  return (
    <div className="h-64 w-full bg-gray-100 rounded-md flex items-center justify-center text-gray-600">
      {points.length > 0
        ? 'Trip replay map would render here.'
        : 'No route data available for replay.'}
    </div>
  );
};

export default MapReplay;