import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import mapboxgl from 'mapbox-gl';

// Note: Mapbox GL JS and CSS must be loaded externally
// I've included the CSS here for a single-file solution.
const MAPBOX_CSS = `
.mapboxgl-map {
    width: 100%;
    height: 100%;
}
.mapboxgl-marker {
    background-size: cover;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
}
.mapboxgl-marker.origin {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234CAF50"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>');
}
.mapboxgl-marker.destination {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23F44336"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>');
}
`;

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gybTRqcGFpZmwwbXgifQ.-g_vE53SD2WrJ6tFX7ImCg';

const generateLogSheet = (trip) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const fontSize = 10;
  const headerHeight = 25;
  const tableTop = margin + headerHeight + 5;
  const tableWidth = pageWidth - 2 * margin;

  doc.setFontSize(16);
  doc.text("Daily Log Sheet", pageWidth / 2, margin + 5, { align: 'center' });
  doc.setFontSize(fontSize);
  doc.text(`Driver: ${trip.driverName}`, margin, margin + 12);
  doc.text(`Vehicle: ${trip.vehicleNumber}`, margin, margin + 18);
  doc.text(`Date: ${new Date(trip.departureTime).toLocaleDateString()}`, pageWidth - margin, margin + 12, { align: 'right' });
  doc.text(`Trip ID: ${trip._id}`, pageWidth - margin, margin + 18, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.rect(margin, tableTop, tableWidth, 40);
  const sectionHeight = 40;
  const timeLabels = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

  for (let i = 0; i < 24; i++) {
    const x = margin + (i * tableWidth) / 24;
    doc.line(x, tableTop, x, tableTop + sectionHeight);
    doc.text(timeLabels[i], x + (tableWidth / 48), tableTop - 2, { align: 'center' });
  }

  const logSections = [
    { name: 'OFF-DUTY', y: tableTop + sectionHeight * 0.1 },
    { name: 'SLEEPER BERTH', y: tableTop + sectionHeight * 0.35 },
    { name: 'DRIVING', y: tableTop + sectionHeight * 0.6 },
    { name: 'ON-DUTY', y: tableTop + sectionHeight * 0.85 }
  ];

  logSections.forEach(section => {
    doc.text(section.name, margin - 2, section.y, { align: 'right' });
  });

  const tableData = [
    ['Origin', trip.origin],
    ['Destination', trip.destination],
    ['Pickup Location', trip.pickupLocation],
    ['Dropoff Location', trip.dropoffLocation],
    ['Current Cycle Used', `${trip.cycleUsed} hrs`],
  ];

  doc.autoTable({
    startY: tableTop + sectionHeight + 10,
    head: [['Field', 'Details']],
    body: tableData,
    theme: 'grid',
    margin: { left: margin, right: margin }
  });

  doc.setFontSize(8);
  doc.text("Driver Signature: _________________________________", margin, pageHeight - margin - 5);
  doc.text("Supervisor Signature: _________________________________", pageWidth - margin, pageHeight - margin - 5, { align: 'right' });
  doc.save(`LogSheet-${trip._id}.pdf`);
};

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">FleetTrack</Link>
        <div>
          <Link to="/" className="px-4 hover:text-gray-400 transition-colors">Home</Link>
          <Link to="/dashboard" className="px-4 hover:text-gray-400 transition-colors">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
}

function TripMap({ origin, destination }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || map.current || !origin || !destination) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [origin.lng, origin.lat],
      zoom: 6,
    });

    map.current.on('load', () => {
      new mapboxgl.Marker({ color: '#4CAF50' })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup().setText('Origin'))
        .addTo(map.current);

      new mapboxgl.Marker({ color: '#F44336' })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup().setText('Destination'))
        .addTo(map.current);

      const bounds = new mapboxgl.LngLatBounds([origin.lng, origin.lat], [destination.lng, destination.lat]);
      map.current.fitBounds(bounds, {
        padding: 50
      });

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [origin.lng, origin.lat],
              [destination.lng, destination.lat],
            ],
          },
        },
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#1E88E5',
          'line-width': 4,
        },
      });
    });

    return () => map.current?.remove();
  }, [origin, destination]);

  return (
    <div className="w-full h-72 rounded-lg overflow-hidden my-4 shadow-inner">
      <style>{MAPBOX_CSS}</style>
      <div ref={mapContainer} className="mapboxgl-map" />
    </div>
  );
}

function TripCard({ trip }) {
  const originCoord = { lat: parseFloat(trip.origin.split(',')[0]), lng: parseFloat(trip.origin.split(',')[1]) };
  const destinationCoord = { lat: parseFloat(trip.destination.split(',')[0]), lng: parseFloat(trip.destination.split(',')[1]) };

  const getStatus = (departureTime, cycleHours) => {
    const depTime = new Date(departureTime);
    const now = new Date();
    const hoursElapsed = (now - depTime) / (1000 * 60 * 60);
    if (hoursElapsed < cycleHours) return 'active';
    if (hoursElapsed < cycleHours + 2) return 'pending';
    return 'overdue';
  };

  const statusColor = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    overdue: 'bg-red-500'
  };
  const status = getStatus(trip.departureTime, trip.cycleUsed);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{trip.driverName}</h2>
        <span className={`w-4 h-4 rounded-full ${statusColor[status]} shadow-md`} title={status}></span>
      </div>
      <div className="flex-grow">
        <p className="text-sm text-gray-600 mb-2"><strong>Vehicle:</strong> {trip.vehicleNumber}</p>
        <p className="text-sm text-gray-600 mb-2"><strong>Origin:</strong> {trip.origin}</p>
        <p className="text-sm text-gray-600 mb-2"><strong>Destination:</strong> {trip.destination}</p>
        <p className="text-sm text-gray-600 mb-2"><strong>Departure:</strong> {new Date(trip.departureTime).toLocaleString()}</p>
        <p className="text-sm text-gray-600 mb-2"><strong>Cycle Used:</strong> {trip.cycleUsed} hrs</p>
      </div>
      <TripMap origin={originCoord} destination={destinationCoord} />
      <div className="flex justify-between items-center mt-4">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize text-white ${statusColor[status]}`}>
          {status}
        </span>
        <button
          onClick={() => generateLogSheet(trip)}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Print Log Sheet
        </button>
      </div>
    </div>
  );
}

function TripForm() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation(`${latitude},${longitude}`);
        setLocationStatus('granted');
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationStatus('denied');
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const tripData = {
      origin,
      destination,
      departureTime,
      driverName,
      vehicleNumber,
      currentLocation,
      cycleUsed: Number(cycleUsed),
    };

    try {
      await API.post('/api/trips/', tripData);
      setMessage('Trip submitted successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Submission failed:', error.response?.data || error.message);
      setMessage('Failed to submit trip.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container bg-gray-100 min-h-screen p-8 flex items-center justify-center">
      <div className="form-container bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Log a New Trip</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Driver Name</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Vehicle Number</label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Current Cycle Used (hrs)</label>
            <input
              type="number"
              value={cycleUsed}
              onChange={(e) => setCycleUsed(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Current Location</label>
            <input
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-200"
              readOnly
            />
            <p className={`text-sm mt-1 font-medium ${locationStatus === 'granted' ? 'text-green-600' : locationStatus === 'denied' ? 'text-red-600' : 'text-yellow-600'}`}>
              Location: {locationStatus === 'granted' ? 'Granted' : locationStatus === 'denied' ? 'Denied' : 'Fetching...'}
            </p>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Departure Time</label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Log Trip'}
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-4 rounded-lg text-center ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await API.get('/api/trips/');
        const validTrips = res.data.filter(trip => trip.origin && trip.destination);
        setTrips(validTrips);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Trip Dashboard</h1>
      {loading ? (
        <p className="text-center text-gray-600">Loading trips...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : trips.length === 0 ? (
        <p className="text-center text-gray-600">No trips logged yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<TripForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
