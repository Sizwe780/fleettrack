import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';

export default function TripClusterMap({ trips }) {
  const mapRef = useRef(null);

  // Risk color helper
  const getRiskColor = (trip) => {
    const fatigue = trip.analysis?.fatigueRisk ?? 0;
    const fuel = trip.analysis?.fuelRisk ?? 0;
    const delay = trip.analysis?.delayRisk ?? 0;
    const maxRisk = Math.max(fatigue, fuel, delay);

    if (maxRisk > 0.8) return '#e53935'; // red
    if (maxRisk > 0.6) return '#fb8c00'; // orange
    if (maxRisk > 0.4) return '#fdd835'; // yellow
    return '#43a047'; // green
  };

  useEffect(() => {
    if (!trips || trips.length === 0) return;

    // Clean up previous map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map('trip-cluster-map').setView([-33.96, 25.6], 10); // Nelson Mandela Bay
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const markers = L.markerClusterGroup();

    trips.forEach(trip => {
      (trip.coordinates || []).forEach(coord => {
        if (Array.isArray(coord) && coord.length === 2) {
          const riskColor = getRiskColor(trip);
          const icon = L.divIcon({
            className: 'risk-marker',
            html: `<div style="background:${riskColor};width:12px;height:12px;border-radius:50%;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });

          const marker = L.marker(coord, { icon }).bindPopup(`
            <strong>${trip.driver_name || 'Unknown Driver'}</strong><br/>
            ${trip.origin || 'Unknown Origin'} → ${trip.destination || 'Unknown Destination'}<br/>
            Status: ${trip.status || 'N/A'}
          `);
          markers.addLayer(marker);
        }
      });
    });

    map.addLayer(markers);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [trips]);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">📍 Trip Cluster Map</h2>
      <div id="trip-cluster-map" className="h-96 w-full rounded shadow" />

      {/* Legend */}
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p><span style={{ color: '#e53935' }}>⬤</span> High Risk</p>
        <p><span style={{ color: '#fb8c00' }}>⬤</span> Moderate Risk</p>
        <p><span style={{ color: '#fdd835' }}>⬤</span> Low Risk</p>
        <p><span style={{ color: '#43a047' }}>⬤</span> Minimal Risk</p>
      </div>
    </div>
  );
}