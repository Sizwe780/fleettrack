import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function TripLogsheet({ trip }) {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!trip || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [28, -29], 
      zoom: 5
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    new mapboxgl.Marker().setLngLat([trip.origin.longitude, trip.origin.latitude]).addTo(map);

    new mapboxgl.Marker().setLngLat([trip.destination.longitude, trip.destination.latitude]).addTo(map);

    const getRoute = async () => {
      const start = `${trip.origin.longitude},${trip.origin.latitude}`;
      const end = `${trip.destination.longitude},${trip.destination.latitude}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const route = data.routes[0].geometry;

        if (map.getSource('route')) {
          map.getSource('route').setData({
            'type': 'Feature',
            'properties': {},
            'geometry': route
          });
        } else {
          map.addLayer({
            id: 'route',
            type: 'line',
            source: {
              type: 'geojson',
              data: {
                'type': 'Feature',
                'properties': {},
                'geometry': route
              }
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3887be',
              'line-width': 5,
              'line-opacity': 0.75
            }
          });
        }
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([trip.origin.longitude, trip.origin.latitude]);
        bounds.extend([trip.destination.longitude, trip.destination.latitude]);
        map.fitBounds(bounds, { padding: 50 });

      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    map.on('load', getRoute);

    return () => map.remove();
  }, [trip]);

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Daily Logsheet", 14, 22);

    doc.autoTable({
      startY: 30,
      head: [['Field', 'Details']],
      body: [
        ['Trip ID', trip._id || 'N/A'],
        ['Driver Name', trip.driver_name || 'N/A'],
        ['Origin', trip.origin.location || 'N/A'],
        ['Destination', trip.destination.location || 'N/A'],
        ['Date', trip.date || 'N/A'],
        ['Departure Time', trip.departure_time || 'N/A'],
        ['Cycle Used', trip.cycle_used || 'N/A']
      ]
    });

    doc.setFontSize(14);
    doc.text("Remarks:", 14, doc.autoTable.previous.finalY + 10);
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(trip.remarks || 'No remarks provided.', 180);
    doc.text(splitText, 14, doc.autoTable.previous.finalY + 18);

    doc.save(`logsheet-${trip._id || 'new-trip'}.pdf`);
  };

  if (!trip) return null;

  return (
    <div>
      <h3>Trip Logsheet</h3>
      <div ref={mapContainerRef} style={{ height: '400px', width: '100%' }} />
      <div style={{ marginTop: '20px' }}>
        <h4>Remarks</h4>
        <p>{trip.remarks || 'No remarks recorded for this trip.'}</p>
        <button onClick={handleExport}>Export Logsheet as PDF</button>
      </div>
    </div>
  );
}