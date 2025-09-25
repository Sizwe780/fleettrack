import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { listenToLiveTrip } from '../firebase';

const LiveTripMap = ({ tripId }) => {
  const [tripData, setTripData] = useState(null);

  useEffect(() => {
    const unsubscribe = listenToLiveTrip(tripId, setTripData);
    return () => unsubscribe();
  }, [tripId]);

  if (!tripData || !tripData.tripPath?.length) return <p>Loading trip map…</p>;

  const { tripPath, liveLocation, stops, incidents } = tripData;

  return (
    <div className="trip-map">
      <MapContainer center={[tripPath[0].lat, tripPath[0].lng]} zoom={6} scrollWheelZoom={false} style={{ height: '300px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={tripPath.map(p => [p.lat, p.lng])} color="blue" />
        {stops?.map((stop, i) => (
          <Marker key={`stop-${i}`} position={[stop.lat, stop.lng]}>
            <Popup>
              <strong>{stop.location}</strong><br />
              {stop.remark}
            </Popup>
          </Marker>
        ))}
        {liveLocation && (
          <Marker position={[liveLocation.lat, liveLocation.lng]}>
            <Popup>
              <strong>Live Location</strong><br />
              Last updated: {new Date(tripData.updatedAt).toLocaleTimeString()}
            </Popup>
          </Marker>
        )}
        {incidents?.map((incident, i) => (
          <Marker key={`incident-${i}`} position={[incident.location.lat, incident.location.lng]}>
            <Popup>
              <strong>{incident.type}</strong><br />
              Severity: {incident.severity}<br />
              Time: {new Date(incident.time).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveTripMap;