import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

const FleetHeatmap = ({ trips }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10',
        center: [25.6, -33.96], // Gqeberha default
        zoom: 5,
      });
    }

    if (map.current && trips.length > 0) {
      const coordinates = trips.flatMap((trip) => trip.coordinates ?? []);
      const geojson = {
        type: 'FeatureCollection',
        features: coordinates.map((coord) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [coord.lng, coord.lat],
          },
        })),
      };

      if (map.current.getSource('fleet-heat')) {
        map.current.getSource('fleet-heat').setData(geojson);
      } else {
        map.current.addSource('fleet-heat', {
          type: 'geojson',
          data: geojson,
        });

        map.current.addLayer({
          id: 'fleet-heat-layer',
          type: 'heatmap',
          source: 'fleet-heat',
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': 1,
            'heatmap-radius': 20,
            'heatmap-opacity': 0.6,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0,0,255,0)',
              0.2, 'blue',
              0.4, 'lime',
              0.6, 'yellow',
              0.8, 'orange',
              1, 'red',
            ],
          },
        });
      }
    }
  }, [trips]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2">🔥 Fleet Heatmap</h2>
      <div ref={mapContainer} className="w-full h-[500px] rounded-xl shadow-md border" />
    </div>
  );
};

export default FleetHeatmap;