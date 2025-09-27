import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TripReplayWithStops({ trip }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const intervalRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1000); // ms per step

  useEffect(() => {
    if (!trip.coordinates || trip.coordinates.length === 0 || !mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const mapInstance = L.map(mapContainerRef.current).setView(trip.coordinates[0], 13);
    mapRef.current = mapInstance;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance);

    const path = L.polyline(trip.coordinates, { color: 'blue' }).addTo(mapInstance);
    mapInstance.fitBounds(path.getBounds());

    const marker = L.marker(trip.coordinates[0]).addTo(mapInstance);
    markerRef.current = marker;

    setCurrentIndex(0); // reset replay index

    return () => {
      mapInstance.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [trip.coordinates]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !trip.coordinates || trip.coordinates.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= trip.coordinates.length) {
          clearInterval(intervalRef.current);
          return prev;
        }
        markerRef.current.setLatLng(trip.coordinates[next]);
        return next;
      });
    }, replaySpeed);

    return () => clearInterval(intervalRef.current);
  }, [replaySpeed, trip.coordinates]);

  const stops = trip.analysis?.stops || [];

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2">▶️ Trip Replay</h3>
      <div ref={mapContainerRef} className="h-64 rounded shadow mb-4 overflow-hidden border" />

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