import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function ClusterLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    const markers = L.markerClusterGroup();

    points.forEach(point => {
      const marker = L.marker([point.latitude, point.longitude]);
      marker.bindPopup(point.label);
      markers.addLayer(marker);
    });

    map.addLayer(markers);

    return () => {
      map.removeLayer(markers);
    };
  }, [map, points]);

  return null;
}

export default function ClusterMap() {
  const [tripPoints, setTripPoints] = useState([]);

  useEffect(() => {
    const fetchTripPoints = async () => {
      const q = query(
        collection(db, "apps/fleet-track-app/trips"),
        where("status", "==", "completed")
      );
      const snapshot = await getDocs(q);

      const points = snapshot.docs.flatMap(doc => {
        const trip = doc.data();
        if (!trip.origin_geo || !trip.destination_geo) return [];

        return [
          {
            id: `${doc.id}-origin`,
            latitude: trip.origin_geo.latitude,
            longitude: trip.origin_geo.longitude,
            label: `Origin: ${trip.origin}`,
          },
          {
            id: `${doc.id}-dest`,
            latitude: trip.destination_geo.latitude,
            longitude: trip.destination_geo.longitude,
            label: `Destination: ${trip.destination}`,
          },
        ];
      });

      setTripPoints(points);
    };

    fetchTripPoints();
  }, []);

  return (
    <div className="w-full h-[700px] rounded-xl shadow-lg overflow-hidden">
      <MapContainer center={[-33.96, 25.6]} zoom={9} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClusterLayer points={tripPoints} />
      </MapContainer>
    </div>
  );
}