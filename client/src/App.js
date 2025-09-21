import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Gauge, CheckCircle, Locate, Loader, Printer, ListChecks } from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, orderBy, where, getDocs, setLogLevel } from 'firebase/firestore';

const App = () => {
  // State management for UI tabs and form data
  const [activeTab, setActiveTab] = useState('home');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    cycleUsed: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [mapData, setMapData] = useState(null);
  const [logData, setLogData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Firestore and Auth instances
  const dbRef = useRef(null);
  const authRef = useRef(null);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const logCanvasRef = useRef(null);

  // Global variables from the environment
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
  const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFudWVsYXJvc2VybyIsImEiOiJjbHhxNHB4ajEwc3d4Mmlyd3RjdHB4d2E1In0.niS9m5pCbK5Kv-_On2mTcg';


  // --- Firebase Initialization and Authentication ---
  useEffect(() => {
    if (firebaseConfig) {
      const app = initializeApp(firebaseConfig);
      dbRef.current = getFirestore(app);
      authRef.current = getAuth(app);
      setLogLevel('debug');

      const unsubscribe = onAuthStateChanged(authRef.current, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          if (initialAuthToken) {
            await signInWithCustomToken(authRef.current, initialAuthToken);
          } else {
            await signInAnonymously(authRef.current);
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } else {
      console.error("Firebase config is not available. Firestore will not be functional.");
    }
  }, []);

  // --- Firestore Data Fetching ---
  useEffect(() => {
    if (!isAuthReady || !dbRef.current || !userId) return;

    const userTripsCollectionRef = collection(dbRef.current, `/artifacts/${appId}/users/${userId}/trips`);
    const q = query(userTripsCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trips = [];
      snapshot.forEach(doc => {
        trips.push({ id: doc.id, ...doc.data() });
      });
      if (trips.length > 0) {
        setMapData(trips[0]);
        setLogData(trips[0].logEvents || []);
        setFormData({
            origin: trips[0].origin,
            destination: trips[0].destination,
            cycleUsed: trips[0].cycleUsed,
        });
      }
    });

    return () => unsubscribe();
  }, [isAuthReady, userId]);

  // --- Dynamic Mapbox Script Loading ---
  useEffect(() => {
    // Dynamically load the Mapbox GL JS script and stylesheet
    if (document.getElementById('mapbox-script')) return;

    const script = document.createElement('script');
    script.id = 'mapbox-script';
    script.src = `https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.js`;
    script.async = true;
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.href = `https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.css`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    script.onload = () => {
        // Now that the script is loaded, we can safely initialize the map
        if (mapContainer.current && !mapRef.current) {
            window.mapboxgl.accessToken = MAPBOX_TOKEN;
            mapRef.current = new window.mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-98.58, 39.82],
                zoom: 3
            });
        }
    };
  }, []);

  // --- Mapbox Initialization and Route Drawing ---
  useEffect(() => {
    if (!mapRef.current || !mapData) return;
    
    // Clear existing layers and sources
    if (mapRef.current.getLayer('route')) {
      mapRef.current.removeLayer('route');
    }
    if (mapRef.current.getSource('route')) {
      mapRef.current.removeSource('route');
    }
    
    // Clear existing markers
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

    const originCoords = [-122.4194, 37.7749]; // San Francisco
    const destinationCoords = [-74.0060, 40.7128]; // New York

    // Add trip markers
    const originMarker = new window.mapboxgl.Marker({ color: 'green' })
      .setLngLat(originCoords)
      .setPopup(new window.mapboxgl.Popup().setHTML(`
        <div class="font-bold text-sm">Origin</div>
        <div class="text-xs">${mapData.origin}</div>
      `))
      .addTo(mapRef.current);

    const destinationMarker = new window.mapboxgl.Marker({ color: 'red' })
      .setLngLat(destinationCoords)
      .setPopup(new window.mapboxgl.Popup().setHTML(`
        <div class="font-bold text-sm">Destination</div>
        <div class="text-xs">${mapData.destination}</div>
      `))
      .addTo(mapRef.current);
      
    // Add current location marker if available
    if (currentLocation) {
        new window.mapboxgl.Marker({ color: 'blue' })
            .setLngLat([currentLocation.lng, currentLocation.lat])
            .setPopup(new window.mapboxgl.Popup().setHTML(`
                <div class="font-bold text-sm">Current Location</div>
                <div class="text-xs">Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}</div>
            `))
            .addTo(mapRef.current);
    }

    // Fit the map to the bounds of the markers
    const bounds = new window.mapboxgl.LngLatBounds();
    bounds.extend(originCoords);
    bounds.extend(destinationCoords);
    if (currentLocation) {
        bounds.extend([currentLocation.lng, currentLocation.lat]);
    }
    mapRef.current.fitBounds(bounds, {
      padding: 100
    });

    const route = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            originCoords,
            [-105.00, 39.73],
            [-96.80, 32.77],
            destinationCoords
          ]
        }
      }]
    };

    mapRef.current.addSource('route', {
      'type': 'geojson',
      'data': route
    });

    mapRef.current.addLayer({
      'id': 'route',
      'type': 'line',
      'source': 'route',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#3b82f6',
        'line-width': 8,
        'line-opacity': 0.75
      }
    });

  }, [activeTab, mapRef, mapData, currentLocation]);

  // --- ELD Log Canvas Drawing ---
  useEffect(() => {
    if (activeTab !== 'logs' || !logCanvasRef.current || !logData) return;

    const canvas = logCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const hourWidth = width / 24;
    const statusHeight = height / 4;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 24; i++) {
      ctx.beginPath();
      ctx.moveTo(i * hourWidth, 0);
      ctx.lineTo(i * hourWidth, height);
      ctx.stroke();
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(i, i * hourWidth, height - 5);
    }
    const statusLabels = ['Off Duty', 'Sleeper', 'Driving', 'On Duty'];
    ctx.textAlign = 'left';
    statusLabels.forEach((label, i) => {
      ctx.fillText(label, 5, i * statusHeight + statusHeight / 2);
    });

    const statusMap = {
      'Off Duty': 0,
      'Sleeper': 1,
      'Driving': 2,
      'On Duty': 3
    };

    ctx.lineWidth = 4;
    logData.forEach((event, index) => {
      const startX = event.startTime / 60 * hourWidth;
      const endX = event.endTime / 60 * hourWidth;
      const y = statusMap[event.status] * statusHeight + statusHeight / 2;

      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);

      switch (event.status) {
        case 'Driving':
          ctx.strokeStyle = '#ef4444';
          break;
        case 'On Duty':
          ctx.strokeStyle = '#f97316';
          break;
        case 'Sleeper':
          ctx.strokeStyle = '#3b82f6';
          break;
        case 'Off Duty':
          ctx.strokeStyle = '#10b981';
          break;
        default:
          ctx.strokeStyle = '#6b7280';
      }
      ctx.stroke();
    });

  }, [activeTab, logData]);

  // --- Form Handlers and Logic ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMessage('Location found!');
          setMessageType('success');
        },
        (error) => {
          console.error("Geolocation error:", error);
          setMessage('Unable to retrieve location.');
          setMessageType('error');
          setCurrentLocation(null);
        }
      );
    } else {
      setMessage('Geolocation is not supported by your browser.');
      setMessageType('error');
      setCurrentLocation(null);
    }
  };

  const handlePlanTrip = async () => {
    setMessage('');
    setMessageType('');
    if (!formData.origin || !formData.destination || !formData.cycleUsed) {
      setMessage('Please fill in all fields.');
      setMessageType('error');
      return;
    }

    if (!isAuthReady || !dbRef.current || !userId) {
      setMessage('Authentication not ready. Please wait.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);

    const distance = 1500;
    const avgSpeed = 60;
    const totalDrivingTime = distance / avgSpeed;
    const dailyDrivingLimit = 11;
    const dailyOffDutyLimit = 10;

    const logEvents = [];
    let remainingDrivingHours = totalDrivingTime;
    let totalDays = Math.ceil(totalDrivingTime / dailyDrivingLimit);

    for (let day = 1; day <= totalDays; day++) {
      let drivingHoursToday = Math.min(remainingDrivingHours, dailyDrivingLimit);
      let offDutyHoursToday = dailyOffDutyLimit;

      logEvents.push({
        status: 'Off Duty',
        startTime: 0,
        endTime: offDutyHoursToday * 60,
      });
      logEvents.push({
        status: 'Driving',
        startTime: offDutyHoursToday * 60,
        endTime: (offDutyHoursToday + drivingHoursToday) * 60,
      });
      if (drivingHoursToday > 8) {
         logEvents.push({
           status: 'On Duty',
           startTime: (offDutyHoursToday + 8) * 60,
           endTime: (offDutyHoursToday + 8.5) * 60,
         });
      }
      remainingDrivingHours -= drivingHoursToday;
    }

    const tripData = {
      origin: formData.origin,
      destination: formData.destination,
      cycleUsed: formData.cycleUsed,
      distance: distance,
      logEvents: logEvents,
      timestamp: new Date().toISOString(),
      userId: userId,
    };

    try {
      const userTripsCollectionRef = collection(dbRef.current, `/artifacts/${appId}/users/${userId}/trips`);
      await addDoc(userTripsCollectionRef, tripData);
      setMessage('Trip plan created and saved successfully!');
      setMessageType('success');
      setActiveTab('map');
      setMapData(tripData);
      setLogData(tripData.logEvents);
    } catch (e) {
      console.error("Error adding document: ", e);
      setMessage('Error saving trip plan. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Plan a New Trip</h2>
            <p className="text-gray-500 mb-6">Fill out the details below to generate a route and ELD log for your trip.</p>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <div className="relative">
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <div className="relative">
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="e.g., New York, NY"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Cycle Used (in hours)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="cycleUsed"
                    value={formData.cycleUsed}
                    onChange={handleChange}
                    placeholder="e.g., 25"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Gauge className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handlePlanTrip}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 shadow-md disabled:bg-gray-400"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin mr-2" />
                    Planning Trip...
                  </>
                ) : (
                  <>
                    <Truck className="h-5 w-5 mr-2" />
                    Plan Trip
                  </>
                )}
              </button>
            </form>
            
            {message && (
              <div className={`mt-6 px-4 py-3 rounded-xl text-center font-medium ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}
          </div>
        );
      case 'map':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Map</h2>
            <p className="text-gray-500 mb-4">Route from **{mapData?.origin || '...'}** to **{mapData?.destination || '...'}**.</p>
            <div ref={mapContainer} className="h-[600px] w-full rounded-xl shadow-lg border border-gray-200"></div>
            {userId && (
                <div className="mt-4 text-sm text-gray-500">
                    <span className="font-bold">Trip ID:</span> {mapData?.id || 'N/A'}
                    <br/>
                    <span className="font-bold">User ID:</span> {userId}
                </div>
            )}
          </div>
        );
      case 'logs':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ELD Log</h2>
            <p className="text-gray-500 mb-4">This log sheet is a simulated representation of your driving hours.</p>
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
              <canvas ref={logCanvasRef} width="800" height="200" className="w-full"></canvas>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Log Events</h3>
              <ul className="space-y-2">
                {logData.map((event, index) => (
                  <li key={index} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {event.status === 'Driving' && <Truck className="h-5 w-5 text-red-500" />}
                    {event.status === 'On Duty' && <Gauge className="h-5 w-5 text-orange-500" />}
                    {event.status === 'Sleeper' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                    {event.status === 'Off Duty' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    <span className="font-medium text-gray-700">{event.status}:</span>
                    <span className="text-sm text-gray-500">{Math.floor(event.startTime / 60).toString().padStart(2, '0')}:{Math.floor(event.startTime % 60).toString().padStart(2, '0')} - {Math.floor(event.endTime / 60).toString().padStart(2, '0')}:{Math.floor(event.endTime % 60).toString().padStart(2, '0')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans antialiased text-gray-900">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">FleetTrack</h1>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex justify-around p-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-full transition-colors duration-200 font-medium ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <Truck className="h-5 w-5 inline-block mr-2" /> Home
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-full transition-colors duration-200 font-medium ${activeTab === 'map' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <MapPin className="h-5 w-5 inline-block mr-2" /> Map
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-full transition-colors duration-200 font-medium ${activeTab === 'logs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <ListChecks className="h-5 w-5 inline-block mr-2" /> Logs
            </button>
          </div>

          {/* Main Content Area */}
          <div className="bg-white p-6 rounded-b-3xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
