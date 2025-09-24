import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TripReplay({ coordinates }) {
  const mapRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map('trip-map').setView(coordinates[0], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'FleetTrack Replay • OpenStreetMap',
    }).addTo(map);

    const route = L.polyline(coordinates, { color: 'blue' }).addTo(map);
    map.fitBounds(route.getBounds());

    const marker = L.marker(coordinates[0]).addTo(map);
    let i = 0;

    intervalRef.current = setInterval(() => {
      if (i < coordinates.length) {
        marker.setLatLng(coordinates[i]);
        i++;
      } else {
        clearInterval(intervalRef.current);
      }
    }, 500);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      clearInterval(intervalRef.current);
    };
  }, [coordinates]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">▶️ Trip Replay</h3>
      <div id="trip-map" className="h-64 w-full rounded-lg shadow overflow-hidden border" />
    </div>
  );
}