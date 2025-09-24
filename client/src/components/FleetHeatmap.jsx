import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

export default function FleetHeatmap({ trips }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!trips || trips.length === 0) return;

    // Clean up previous map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map('fleet-heatmap').setView([-33.96, 25.6], 10); // Nelson Mandela Bay
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const heatPoints = trips
      .flatMap(t => Array.isArray(t.coordinates) ? t.coordinates : [])
      .filter(coord => Array.isArray(coord) && coord.length === 2)
      .map(([lat, lng]) => [lat, lng, 0.5]); // lat, lng, intensity

    if (heatPoints.length > 0) {
      L.heatLayer(heatPoints, { radius: 25 }).addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [trips]);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">🔥 Fleet Heatmap</h2>
      <div id="fleet-heatmap" className="h-96 w-full rounded shadow" />
    </div>
  );
}