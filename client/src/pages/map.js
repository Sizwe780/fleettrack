import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import L from 'leaflet';

const MapPage = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const snapshot = await getDocs(collection(db, 'trips'));
      const allTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(allTrips.filter(t => Array.isArray(t.coordinates) && t.coordinates.length > 0));
    };

    fetchTrips();
  }, []);

  const getColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
  };

  return (
    <div className="h-screen w-full">
      <MapContainer center={[-33.96, 25.6]} zoom={7} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {trips.map(trip => {
          const coords = trip.coordinates.map(c => [c.lat, c.lng]);
          const origin = coords[0];
          const destination = coords[coords.length - 1];
          const score = trip.healthScore ?? 100;

          return (
            <React.Fragment key={trip.id}>
              <Polyline positions={coords} color={getColor(score)} />
              <Marker position={origin}>
                <Popup>
                  <strong>{trip.driver_name}</strong><br />
                  {trip.origin} → {trip.destination}<br />
                  Profit: R{trip.analysis?.profitability?.netProfit ?? 0}
                </Popup>
              </Marker>
              <Marker position={destination}>
                <Popup>
                  Destination: {trip.destination}
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapPage;