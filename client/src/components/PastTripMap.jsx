import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const PastTripMap = ({ trip }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const { origin, destination, stops, routeData } = trip;

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [origin.lng, origin.lat],
        zoom: 6,
      });

      // Origin Marker
      new mapboxgl.Marker({ color: 'green' })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup().setText('Origin'))
        .addTo(map.current);

      // Destination Marker
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup().setText('Destination'))
        .addTo(map.current);

      // Stop Markers
      stops.forEach((stop, idx) => {
        new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([stop.lng, stop.lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
              <strong>Stop ${idx + 1}</strong><br/>
              ${stop.timestamp}<br/>
              ${stop.remark || 'No remark'}
            `)
          )
          .addTo(map.current);
      });

      // Route Line (optional)
      if (routeData) {
        map.current.on('load', () => {
          map.current.addSource('route', {
            type: 'geojson',
            data: routeData,
          });

          map.current.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#888', 'line-width': 4 },
          });
        });
      }
    }
  }, [trip]);

  return (
    <div className="map-wrapper">
      <h2>Trip Route</h2>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default PastTripMap;