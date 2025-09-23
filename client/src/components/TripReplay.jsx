import React, { useEffect, useState } from 'react';
import MapReplay from './MapReplay'; // Your animated map component

const TripReplay = ({ trip }) => {
  const [replayData, setReplayData] = useState([]);

  useEffect(() => {
    if (!trip?.coordinates || trip.coordinates.length === 0) return;

    const enriched = trip.coordinates.map((coord, i) => ({
      lat: Array.isArray(coord) ? coord[0] : coord.lat,
      lng: Array.isArray(coord) ? coord[1] : coord.lng,
      timestamp: trip.statusHistory?.[i]?.timestamp || null,
      status: trip.statusHistory?.[i]?.status || null
    }));

    setReplayData(enriched);
  }, [trip]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-xl font-bold mb-4">Trip Replay</h2>
      {replayData.length > 0 ? (
        <MapReplay points={replayData} />
      ) : (
        <p className="text-gray-500">No replay data available for this trip.</p>
      )}
    </div>
  );
};

export default TripReplay;