import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TripMap = ({ origin, destination, routeData }) => {
  const { path = [], fuelStops = [], restBreaks = [] } = routeData || {};
  const hasPath = Array.isArray(path) && path.length > 0;
  const mapCenter = hasPath ? path[0] : [-33.9608, 25.6022]; // Default to Gqeberha if no path

  return (
    <div className="space-y-4">
      <MapContainer center={mapCenter} zoom={6} style={{ height: '400px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {hasPath && <Polyline positions={path} color="blue" />}

        {hasPath && (
          <>
            <Marker position={path[0]}>
              <Popup>Origin: {origin}</Popup>
            </Marker>
            <Marker position={path[path.length - 1]}>
              <Popup>Destination: {destination}</Popup>
            </Marker>
          </>
        )}

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

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs">
        <summary className="cursor-pointer font-semibold text-gray-700">🧭 Map Payload Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(routeData, null, 2)}</pre>
      </details>
    </div>
  );
};

export default TripMap;