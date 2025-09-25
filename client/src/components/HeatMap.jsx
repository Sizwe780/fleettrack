import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import L from 'leaflet';
import 'leaflet.heat';

export default function Heatmap() {
  const [map, setMap] = useState(null);
  const [pointsArray, setPointsArray] = useState([]);
  const [fuelPoints, setFuelPoints] = useState([]);
  const [fatiguePoints, setFatiguePoints] = useState([]);
  const [delayPoints, setDelayPoints] = useState([]);
  const [showLegend, setShowLegend] = useState(true);
  const [showFuel, setShowFuel] = useState(true);
  const [showFatigue, setShowFatigue] = useState(true);
  const [showDelay, setShowDelay] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const container = document.getElementById("heatmap-container");
    if (container && container._leaflet_id) {
      container._leaflet_id = null;
    }

    const mapInstance = L.map("heatmap-container").setView([-33.96, 25.6], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstance);
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "apps/fleet-track-app/trips"));
        const coords = [];
        const fuel = [];
        const fatigue = [];
        const delay = [];

        snapshot.forEach(doc => {
          const data = doc.data();
          const loc = data.origin_location;
          if (loc?.latitude && loc?.longitude) {
            coords.push([loc.latitude, loc.longitude]);
          }

          const segments = data.analysis?.suggestedRoute || [];
          const fuelTrace = data.analysis?.fuelTrace || [];
          const fatigueTrace = data.analysis?.fatigueTrace || [];
          const delayTrace = data.analysis?.delayTrace || [];

          segments.forEach(([lat, lng], i) => {
            if (fuelTrace[i] > 0.8) fuel.push([lat, lng]);
            if (fatigueTrace[i] > 0.6) fatigue.push([lat, lng]);
            if (delayTrace[i] > 0.7) delay.push([lat, lng]);
          });
        });

        setPointsArray(coords);
        setFuelPoints(fuel);
        setFatiguePoints(fatigue);
        setDelayPoints(delay);
        setErrorMsg(coords.length === 0 ? "No trip data available." : "");
      } catch (error) {
        console.error("Heatmap Firestore error:", error.message);
        setErrorMsg("Permission error: Unable to load trip data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  useEffect(() => {
    if (!map) return;

    const heatLayer = L.heatLayer(pointsArray, { radius: 25 }).addTo(map);

    const fuelLayer = showFuel
      ? fuelPoints.map(([lat, lng]) =>
          L.circleMarker([lat, lng], {
            color: 'red',
            radius: 6,
            fillOpacity: 0.6,
          }).addTo(map)
        )
      : [];

    const fatigueLayer = showFatigue
      ? fatiguePoints.map(([lat, lng]) =>
          L.circleMarker([lat, lng], {
            color: 'purple',
            radius: 6,
            fillOpacity: 0.6,
          }).addTo(map)
        )
      : [];

    const delayLayer = showDelay
      ? delayPoints.map(([lat, lng]) =>
          L.circleMarker([lat, lng], {
            color: 'orange',
            radius: 6,
            fillOpacity: 0.6,
          }).addTo(map)
        )
      : [];

    return () => {
      map.removeLayer(heatLayer);
      fuelLayer.forEach(layer => map.removeLayer(layer));
      fatigueLayer.forEach(layer => map.removeLayer(layer));
      delayLayer.forEach(layer => map.removeLayer(layer));
    };
  }, [map, pointsArray, fuelPoints, fatiguePoints, delayPoints, showFuel, showFatigue, showDelay]);

  return (
    <div className="relative h-screen w-full">
      <div
        id="heatmap-container"
        className="h-full w-full z-0 rounded-xl shadow-2xl border border-gray-300 overflow-hidden"
      />

      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-white border border-gray-300 rounded-xl shadow-xl p-4 z-20 space-y-3">
        <h3 className="font-semibold text-gray-800">🧭 Heatmap Controls</h3>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={showFuel} onChange={() => setShowFuel(!showFuel)} />
          <span>Fuel Risk</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={showFatigue} onChange={() => setShowFatigue(!showFatigue)} />
          <span>Fatigue Risk</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={showDelay} onChange={() => setShowDelay(!showDelay)} />
          <span>Delay Risk</span>
        </label>
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="bg-navy text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Toggle Legend
        </button>
        <button
          onClick={() => map?.setView([-33.96, 25.6], 10)}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Reset View
        </button>
      </div>

      {/* Legend Overlay */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-white border border-gray-300 rounded-xl shadow-xl p-4 z-20">
          <h4 className="font-semibold text-gray-800 mb-2">🔥 Intensity Legend</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span> Fuel Risk</li>
            <li><span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span> Fatigue Risk</li>
            <li><span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span> Delay Risk</li>
            <li><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span> Trip Origin Density</li>
          </ul>
        </div>
      )}

      {/* Loading or Error */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600 text-lg font-medium">
          Loading heatmap data...
        </div>
      )}
      {errorMsg && !loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 text-lg font-semibold">
          {errorMsg}
        </div>
      )}
    </div>
  );
}