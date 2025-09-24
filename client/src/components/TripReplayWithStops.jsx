import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TripReplayWithStops({ trip }) {
  const [map, setMap] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1000); // ms per step

  useEffect(() => {
    if (!trip.coordinates || trip.coordinates.length === 0) return;

    const mapInstance = L.map('trip-replay-map').setView(trip.coordinates[0], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance);

    const path = L.polyline(trip.coordinates, { color: 'blue' }).addTo(mapInstance);
    mapInstance.fitBounds(path.getBounds());

    const marker = L.marker(trip.coordinates[0]).addTo(mapInstance);
    setMap({ instance: mapInstance, marker });

    return () => mapInstance.remove();
  }, [trip.coordinates]);

  useEffect(() => {
    if (!map || !trip.coordinates || trip.coordinates.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= trip.coordinates.length) {
          clearInterval(interval);
          return prev;
        }
        map.marker.setLatLng(trip.coordinates[next]);
        return next;
      });
    }, replaySpeed);

    return () => clearInterval(interval);
  }, [map, replaySpeed, trip.coordinates]);

  const stops = trip.analysis?.stops || [];

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2">▶️ Trip Replay</h3>
      <div id="trip-replay-map" className="h-64 rounded shadow mb-4" />

      <label className="text-xs text-gray-600">Replay Speed (ms):</label>
      <input
        type="range"
        min="200"
        max="2000"
        step="100"
        value={replaySpeed}
        onChange={e => setReplaySpeed(Number(e.target.value))}
        className="w-full mb-4"
      />

      {stops.length > 0 && (
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-1">🛑 Detected Stops:</p>
          <ul className="list-disc ml-4">
            {stops.map((stop, i) => (
              <li key={i}>
                {stop.location} @ {new Date(stop.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}