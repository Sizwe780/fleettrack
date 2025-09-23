import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TripMap = ({ origin, destination, routeData }) => {
    const { path, fuelStops, restBreaks } = routeData;
  
    return (
      <MapContainer center={path[0]} zoom={6} style={{ height: '400px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={path} color="blue" />
  
        <Marker position={path[0]}>
          <Popup>Origin: {origin}</Popup>
        </Marker>
        <Marker position={path[path.length - 1]}>
          <Popup>Destination: {destination}</Popup>
        </Marker>
  
        {fuelStops.map((stop, i) => (
          <CircleMarker key={`fuel-${i}`} center={[stop.lat, stop.lng]} radius={6} color="orange">
            <Popup>Fuel Stop @ {stop.km} km</Popup>
          </CircleMarker>
        ))}
  
        {restBreaks.map((rest, i) => (
          <CircleMarker key={`rest-${i}`} center={[rest.lat, rest.lng]} radius={6} color="green">
            <Popup>Rest Break @ {rest.hour}h</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    );
  };

  export default TripMap;
