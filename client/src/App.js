import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Truck, MapPin, Star, User, Clock, Calendar, Globe, Gauge, CheckCircle, XCircle } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [locationStatus, setLocationStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [mapData, setMapData] = useState(null);
  const [logData, setLogData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Request geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation(`${latitude},${longitude}`);
          setLocationStatus('success');
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('unsupported');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsLoading(true);

    const tripData = {
      origin,
      destination,
      driverName,
      vehicleNumber,
      currentLocation,
      cycleUsed: Number(cycleUsed),
      departureTime,
    };

    // Using mock data to simulate the backend response
    try {
      const mockApiResponse = {
        routePolyline: '-_}pGj_l`T~_aO}v_aP_b`D',
        stops: [
          { name: 'Fuel Stop 1', lat: 34.052235, lng: -118.243683, type: 'fuel' },
          { name: 'Rest Area', lat: 35.151774, lng: -115.584347, type: 'rest' },
          { name: 'Fuel Stop 2', lat: 36.565899, lng: -108.995962, type: 'fuel' },
          { name: 'On-Duty', lat: 36.565899, lng: -108.995962, type: 'on_duty' },
        ],
        eldLogs: [
          { day: 1, driving: 10, onDuty: 1, offDuty: 13, sleeperBerth: 0, date: '2025-01-01' },
          { day: 2, driving: 11, onDuty: 1, offDuty: 12, sleeperBerth: 0, date: '2025-01-02' },
          { day: 3, driving: 9, onDuty: 1, offDuty: 14, sleeperBerth: 0, date: '2025-01-03' },
        ],
      };

      setMapData(mockApiResponse.routePolyline);
      setLogData(mockApiResponse.eldLogs);
      setMessage('Trip planned successfully! Check the Map and Logs tabs.');
      setMessageType('success');
      setActiveTab('map');
    } catch (error) {
      console.error('Submission failed:', error.message);
      setMessage(`Failed to plan trip. Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const LocationIndicator = ({ status }) => {
    const statusClasses = {
      pending: 'bg-gray-400 animate-pulse',
      success: 'bg-green-500',
      error: 'bg-red-500',
      unsupported: 'bg-yellow-500',
    };
    const statusText = {
      pending: 'Finding location...',
      success: 'Location found',
      error: 'Location blocked',
      unsupported: 'Geolocation not supported',
    };
    return (
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
        <div className={`w-3 h-3 rounded-full ${statusClasses[status]}`}></div>
        <span>{statusText[status]}</span>
      </div>
    );
  };

  const TripMap = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
      if (!mapData || !window.mapboxgl) {
        return;
      }

      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      window.mapboxgl.accessToken = 'pk.eyJ1Ijoic2l6d2U3ODAiLCJhIjoiY2x1d2R5ZGZqMGQwMTJpcXBtYXk2dW1icSJ9.9j1hS_x2n3K7x_j5l001Q';

      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-98.5833, 39.8333],
        zoom: 3
      });

      map.current.on('load', () => {
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }

        map.current.addSource('route', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'LineString',
              'coordinates': window.mapboxgl.GeometryUtil.decode(mapData)
            }
          }
        });

        map.current.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#1E40AF',
            'line-width': 6
          }
        });
        
        const coordinates = window.mapboxgl.GeometryUtil.decode(mapData);
        if (coordinates.length > 0) {
          const bounds = new window.mapboxgl.LngLatBounds();
          coordinates.forEach(coord => {
            bounds.extend(coord);
          });
          map.current.fitBounds(bounds, { padding: 50 });
        }
      });
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }, [mapData]);

    if (!mapData) {
      return <div className="p-8 text-center text-gray-500">Submit a trip to see the map!</div>;
    }
    return <div ref={mapContainer} className="h-[600px] w-full rounded-xl shadow-lg" />;
  };

  const ELDLogSheet = () => {
    if (!logData || logData.length === 0) {
      return <div className="p-8 text-center text-gray-500">No ELD log data available. Submit a trip to generate logs.</div>;
    }

    const maxHours = 24;

    const renderTimeBlocks = (log) => {
      const totalHours = log.driving + log.onDuty + log.offDuty + log.sleeperBerth;
      if (totalHours !== maxHours) {
        console.error(`Total hours for day ${log.day} is not 24. It is ${totalHours}`);
      }

      const drivingWidth = (log.driving / maxHours) * 100;
      const onDutyWidth = (log.onDuty / maxHours) * 100;
      const offDutyWidth = (log.offDuty / maxHours) * 100;
      const sleeperBerthWidth = (log.sleeperBerth / maxHours) * 100;

      return (
        <div className="flex w-full h-8 rounded-lg overflow-hidden border border-gray-300">
          {drivingWidth > 0 && <div className="bg-blue-500 text-white text-xs flex items-center justify-center" style={{ width: `${drivingWidth}%` }}>Driving</div>}
          {onDutyWidth > 0 && <div className="bg-yellow-500 text-gray-800 text-xs flex items-center justify-center" style={{ width: `${onDutyWidth}%` }}>On Duty</div>}
          {sleeperBerthWidth > 0 && <div className="bg-purple-500 text-white text-xs flex items-center justify-center" style={{ width: `${sleeperBerthWidth}%` }}>Sleeper Berth</div>}
          {offDutyWidth > 0 && <div className="bg-green-500 text-white text-xs flex items-center justify-center" style={{ width: `${offDutyWidth}%` }}>Off Duty</div>}
        </div>
      );
    };

    return (
      <div className="flex flex-col gap-8 p-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-900">Daily ELD Log Sheets</h2>
        {logData.map((log) => (
          <div key={log.day} className="border-b pb-6 last:border-b-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Day {log.day}: {log.date}</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-medium text-gray-600">
                <span>Driving: {log.driving} hrs</span>
                <span>On Duty: {log.onDuty} hrs</span>
                <span>Off Duty: {log.offDuty} hrs</span>
                <span>Sleeper Berth: {log.sleeperBerth} hrs</span>
              </div>
              {renderTimeBlocks(log)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const TabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col items-center justify-center min-h-full px-4">
            <div className="max-w-7xl w-full mx-auto bg-white rounded-xl shadow-2xl p-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-4">
                Plan a New Trip
              </h1>
              <p className="text-center text-gray-600 mb-6 text-sm">
                Enter the details below to begin your journey.
              </p>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                <div className="flex flex-col">
                  <label htmlFor="origin" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Origin
                  </label>
                  <input
                    id="origin"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Enter origin city or address"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="destination" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Destination
                  </label>
                  <input
                    id="destination"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Enter destination city or address"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} /> Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="driverName" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User size={16} /> Driver Name
                  </label>
                  <input
                    id="driverName"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Enter driver's name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="vehicleNumber" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Truck size={16} /> Vehicle Number
                  </label>
                  <input
                    id="vehicleNumber"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="e.g., ABC-123"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="cycleUsed" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Gauge size={16} /> Cycle Used (Hrs)
                  </label>
                  <input
                    id="cycleUsed"
                    type="number"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="e.g., 20"
                    value={cycleUsed}
                    onChange={(e) => setCycleUsed(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="departureTime" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} /> Departure Time
                  </label>
                  <input
                    id="departureTime"
                    type="time"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label htmlFor="currentLocation" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Globe size={16} /> Current Location
                  </label>
                  <input
                    id="currentLocation"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    value={currentLocation}
                    readOnly
                  />
                  <LocationIndicator status={locationStatus} />
                </div>
                <div className="md:col-span-2 flex justify-center mt-6">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 disabled:bg-indigo-400"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Planning Trip...' : 'Plan Trip'}
                  </button>
                </div>
              </form>
              {message && (
                <div className={`mt-6 p-4 rounded-lg flex items-center justify-center gap-2 ${
                  messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {messageType === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>
        );
      case 'map':
        return <TripMap />;
      case 'logs':
        return <ELDLogSheet />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans antialiased">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.css" rel="stylesheet" />
      <script src="https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@mapbox/polyline@1.1.1/src/polyline.min.js"></script>
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-indigo-600" />
          <span className="text-2xl font-bold text-gray-900">FleetTrack</span>
          <Star className="text-yellow-500 w-5 h-5" fill="currentColor" />
        </div>
        <nav>
          <ul className="flex items-center space-x-4">
            <li>
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'home'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'map'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Map
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'logs'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Logs
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'reports'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Reports
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main className="container mx-auto py-8 px-4">
        <TabContent />
      </main>

      <footer className="w-full text-center py-6 text-gray-500 text-sm">
        <p>
          Need to reach out? Contact us at{' '}
          <a href="mailto:sizwe.ngwenya78@gmail.com" className="text-indigo-600 hover:underline">
            sizwe.ngwenya78@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
