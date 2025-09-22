import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Star, User, Clock, Calendar, Gauge, CheckCircle,
  XCircle, Locate, Loader, Printer, StickyNote, Fuel, Bed, Database,
  ListChecks, TrendingUp, Info, Car, FileText, Settings, BarChart2, Book, Plus, Home } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, orderBy, where, getDocs, setLogLevel, serverTimestamp } from 'firebase/firestore';

// Define global variables provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Mapbox token from user's uploaded file
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

// Initialize Firebase
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Set Firestore log level for debugging
if (db) {
  setLogLevel('debug');
}

const App = () => {
  // State management for UI tabs and form data
  const [activeTab, setActiveTab] = useState('home');
  const [currentLocation, setCurrentLocation] = useState('');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: new Date().toISOString().substring(0, 10),
    driverName: '',
    vehicleNumber: '',
    cycleUsed: 0,
    departureTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [mapData, setMapData] = useState(null);
  const [logData, setLogData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isMapboxLoaded, setIsMapboxLoaded] = useState(false);

  // State for Firebase and Mapbox
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);

  // Firestore & Auth initialization
  useEffect(() => {
    const initFirebase = async () => {
      if (!app || !auth) {
        console.error("Firebase is not initialized. Check your firebase config.");
        return;
      }
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            await signInAnonymously(auth);
          } catch (error) {
            console.error("Firebase Anonymous Auth Error:", error);
          }
        }
        setIsAuthReady(true);
      });

      if (initialAuthToken) {
        try {
          await signInWithCustomToken(auth, initialAuthToken);
        } catch (error) {
          console.error("Firebase Custom Auth Error:", error);
        }
      }
    };
    initFirebase();
  }, []);

  // Dynamically load Mapbox GL JS and CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js';
    script.onload = () => {
      // Set the global access token after the script is loaded
      window.mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
      setIsMapboxLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Mapbox GL JS.");
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // Firestore data listener
  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;

    const logCollectionPath = `artifacts/${appId}/public/data/logs`;
    console.log("Listening to Firestore collection:", logCollectionPath);
    const q = query(collection(db, logCollectionPath), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logs = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      setLogData(logs);
    }, (error) => {
      console.error("Firestore onSnapshot Error:", error);
      showCustomModal("Failed to load data. Please check your network and try again.");
    });

    return () => unsubscribe();
  }, [isAuthReady, db, userId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Show custom modal
  const showCustomModal = (msg) => {
    setModalMessage(msg);
    setShowModal(true);
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  // Get current location using Geolocation API
  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      setLocationStatus('Getting current location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocationStatus('Location found.');
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`)
            .then(res => res.json())
            .then(data => {
              if (data.features && data.features.length > 0) {
                const placeName = data.features[0].place_name;
                setCurrentLocation(placeName);
                setFormData(prevState => ({ ...prevState, origin: placeName }));
                setLocationStatus('Location found.');
              }
            })
            .catch(error => {
              console.error('Error with geocoding:', error);
              setLocationStatus('Failed to find location name.');
            })
            .finally(() => {
              setIsLocating(false);
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationStatus('Geolocation failed. Please enter location manually.');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationStatus("Geolocation is not supported by your browser.");
      showCustomModal("Geolocation is not supported by your browser.");
    }
  };

  // Handle form submission and trip calculation
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessage();
    setIsLoading(true);

    try {
      const backendUrl = "https://logtrack-backend-api.vercel.app/api/calculate_trip/";
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch trip data from backend.');
      }

      const data = await response.json();
      setMapData(data);
      setMessage('Trip calculated successfully!');
      setMessageType('success');
      showCustomModal('Trip calculated and logged successfully! You can view the details in the "Logs" and "Reports" sections.');

      // Save trip data to Firestore
      if (db) {
        const docRef = await addDoc(collection(db, `artifacts/${appId}/public/data/logs`), {
          ...data,
          formData,
          userId,
          timestamp: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
      }
    } catch (error) {
      console.error("Trip calculation error:", error);
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
      showCustomModal(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Map and log drawing logic
  useEffect(() => {
    if (!mapData || !mapContainer.current || !isMapboxLoaded) return;
    if (map.current) map.current.remove();

    const center = mapData.route.route.geometry.coordinates[Math.floor(mapData.route.route.geometry.coordinates.length / 2)];
    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: 4,
    });

    map.current.on('load', () => {
      // Add the route as a line on the map
      map.current.addSource('route', {
        'type': 'geojson',
        'data': mapData.route.route.geometry,
      });
      map.current.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round',
        },
        'paint': {
          'line-color': '#1E40AF', // blue-800
          'line-width': 6,
        },
      });

      // Add markers for origin, destination, and stops
      const addMarker = (lngLat, color, text) => {
        new window.mapboxgl.Marker({ color })
          .setLngLat(lngLat)
          .setPopup(new window.mapboxgl.Popup().setHTML(`<b>${text}</b>`))
          .addTo(map.current);
      };

      addMarker(mapData.route.origin.coordinates, '#10B981', 'Origin: ' + mapData.route.origin.name); // green-500
      addMarker(mapData.route.destination.coordinates, '#EF4444', 'Destination: ' + mapData.route.destination.name); // red-500

      mapData.fuel_stops.forEach(stop => {
        addMarker(stop.coordinates, '#8B5CF6', `Fuel Stop: ${stop.name}`); // violet-500
      });

      mapData.rest_stops.forEach(stop => {
        addMarker(stop.coordinates, '#F59E0B', `Rest Stop: ${stop.name}`); // amber-500
      });

      // Fit map to route bounds
      const bounds = new window.mapboxgl.LngLatBounds();
      mapData.route.route.geometry.coordinates.forEach(coord => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 50 });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapData, isMapboxLoaded]);

  // Function to draw the ELD log sheet on a canvas
  const drawLogSheet = (log, canvasRef) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up drawing styles
    ctx.strokeStyle = '#6B7280'; // gray-500
    ctx.lineWidth = 1;
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#111827'; // gray-900

    // Draw the grid
    const totalHours = 24;
    const hourWidth = width / totalHours;
    for (let i = 0; i <= totalHours; i++) {
      const x = i * hourWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      if (i % 2 === 0) {
        ctx.fillText(i.toString().padStart(2, '0') + ':00', x + 5, 10);
      }
    }

    const dutyStatuses = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty'];
    const rowHeight = height / (dutyStatuses.length + 1);

    dutyStatuses.forEach((status, index) => {
      const y = (index + 1) * rowHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(status, 5, y - 5);
    });

    // Draw the HOS segments
    const driverLogs = log.driver_logs;
    if (driverLogs) {
      ctx.beginPath();
      ctx.moveTo(0, rowHeight * 3); // Start on the 'Driving' line

      driverLogs.forEach((segment, index) => {
        const startHour = parseFloat(segment.start_time);
        const endHour = parseFloat(segment.end_time);
        const startX = startHour * hourWidth;
        const endX = endHour * hourWidth;

        let y;
        switch (segment.status) {
          case 'Off Duty':
            y = rowHeight * 1;
            break;
          case 'Sleeper Berth':
            y = rowHeight * 2;
            break;
          case 'Driving':
            y = rowHeight * 3;
            break;
          case 'On Duty':
            y = rowHeight * 4;
            break;
          default:
            y = 0;
            break;
        }

        if (index > 0) {
          const prevY = (dutyStatuses.indexOf(driverLogs[index - 1].status) + 1) * rowHeight;
          ctx.lineTo(startX, prevY);
        }

        ctx.lineTo(startX, y);
        ctx.lineTo(endX, y);
      });
      ctx.strokeStyle = '#1E40AF'; // blue-800
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // Component for displaying a single log entry
  const LogEntry = ({ log }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const canvasRef = useRef(null);

    // Redraw canvas when expanded
    useEffect(() => {
      if (isExpanded && log.driver_logs) {
        drawLogSheet(log, canvasRef);
      }
    }, [isExpanded, log]);

    return (
      <div className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div>
            <div className="flex items-center text-sm text-gray-500 font-medium">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(log.timestamp.toDate()).toLocaleDateString()}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mt-1">{log.formData.origin} to {log.formData.destination}</h3>
            <p className="text-gray-600 mt-1">Driver: {log.formData.driverName} | Vehicle: {log.formData.vehicleNumber}</p>
          </div>
          <button className="text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1 rounded-full bg-indigo-100">
            {isExpanded ? 'Collapse' : 'View Details'}
          </button>
        </div>
        {isExpanded && (
          <div className="mt-6 border-t pt-6 border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-2 flex items-center"><ListChecks className="w-5 h-5 mr-2 text-indigo-500" /> Trip Summary</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><Gauge className="w-4 h-4 mr-2 text-blue-500" />Total Miles: <span className="ml-2 font-medium text-gray-800">{log.total_miles.toFixed(2)}</span></li>
                  <li className="flex items-center"><Clock className="w-4 h-4 mr-2 text-blue-500" />Total Hours: <span className="ml-2 font-medium text-gray-800">{log.total_hours.toFixed(2)}</span></li>
                  <li className="flex items-center"><Fuel className="w-4 h-4 mr-2 text-blue-500" />Fuel Stops: <span className="ml-2 font-medium text-gray-800">{log.fuel_stops.length}</span></li>
                  <li className="flex items-center"><Bed className="w-4 h-4 mr-2 text-blue-500" />Rest Stops: <span className="ml-2 font-medium text-gray-800">{log.rest_stops.length}</span></li>
                  <li className="flex items-center"><Info className="w-4 h-4 mr-2 text-blue-500" />Cycle Used (Hrs): <span className="ml-2 font-medium text-gray-800">{log.formData.cycleUsed}</span></li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-lg text-gray-800 mb-2 flex items-center"><StickyNote className="w-5 h-5 mr-2 text-indigo-500" />Remarks</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {log.remarks.map((remark, index) => <li key={index}>{remark}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-lg text-gray-800 mb-2 flex items-center"><FileText className="w-5 h-5 mr-2 text-indigo-500" />ELD Log Sheet</h4>
              <canvas ref={canvasRef} width="800" height="300" className="w-full h-auto bg-white rounded-md border border-gray-300"></canvas>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main component render logic
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      {/* Modal for alerts */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm mx-auto">
            <h3 className="text-lg font-bold mb-4">Notification</h3>
            <p className="text-gray-700">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header with Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-indigo-600" />
              <span className="ml-3 text-2xl font-extrabold text-indigo-600 tracking-tight">Logtrack</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'home'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <Home className="inline-block mr-2" /> Home
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'logs'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <Database className="inline-block mr-2" /> Logs
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'reports'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <BarChart2 className="inline-block mr-2" /> Reports
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* User ID Display - Mandatory for multi-user apps */}
        {userId && (
          <div className="text-center text-sm text-gray-500 mb-4">
            User ID: <span className="font-mono text-gray-700">{userId}</span>
          </div>
        )}

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Plan a New Trip</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <div className="flex items-center rounded-md shadow-sm border border-gray-300">
                    <input
                      type="text"
                      name="origin"
                      id="origin"
                      value={formData.origin}
                      onChange={handleChange}
                      className="flex-1 block w-full px-4 py-3 rounded-l-md border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                      placeholder="e.g., New York, NY"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="inline-flex items-center p-3 text-sm font-medium text-white bg-indigo-600 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                      disabled={isLocating}
                    >
                      {isLocating ? <Loader className="h-5 w-5 animate-spin" /> : <Locate className="h-5 w-5" />}
                    </button>
                  </div>
                  {locationStatus && <p className="mt-2 text-xs text-gray-500">{locationStatus}</p>}
                </div>

                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      name="destination"
                      id="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                      placeholder="e.g., Los Angeles, CA"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className="block w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150" required />
                  </div>
                  <div>
                    <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                    <input type="time" name="departureTime" id="departureTime" value={formData.departureTime} onChange={handleChange} className="block w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150" required />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                    <input type="text" name="driverName" id="driverName" value={formData.driverName} onChange={handleChange} className="block w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150" placeholder="e.g., John Smith" required />
                  </div>
                  <div>
                    <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">Vehicle #</label>
                    <input type="text" name="vehicleNumber" id="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} className="block w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150" placeholder="e.g., T-1234" required />
                  </div>
                </div>

                <div>
                  <label htmlFor="cycleUsed" className="block text-sm font-medium text-gray-700 mb-1">Current Cycle Used (Hrs)</label>
                  <input type="number" name="cycleUsed" id="cycleUsed" value={formData.cycleUsed} onChange={handleChange} className="block w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150" min="0" max="70" required />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader className="h-5 w-5 mr-2 animate-spin" /> : <Plus className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Calculate Trip & Log'}
                </button>
              </form>
              {message && (
                <div className={`mt-4 p-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message}
                </div>
              )}
            </div>
            {/* Map Section */}
            <div className="bg-gray-200 rounded-xl shadow-lg relative overflow-hidden" style={{ height: '70vh' }}>
              <div ref={mapContainer} className="h-full w-full rounded-xl" />
              <div className="absolute top-4 left-4 p-2 bg-white rounded-md shadow-md text-sm text-gray-700">
                Map Display
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Saved Trip Logs</h2>
            <div className="space-y-6">
              {logData.length > 0 ? (
                logData.map((log) => (
                  <LogEntry key={log.id} log={log} />
                ))
              ) : (
                <div className="bg-white p-8 text-center rounded-xl shadow-md text-gray-500">
                  <Book className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No trip logs found. Calculate a trip on the Home tab to see it here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Reports & Analytics</h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              {logData.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="p-6 bg-indigo-50 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold text-indigo-700 flex items-center justify-center"><Gauge className="mr-2" />Total Miles Driven</h3>
                      <p className="mt-2 text-4xl font-extrabold text-indigo-600">{logData.reduce((sum, log) => sum + (log.total_miles || 0), 0).toFixed(2)}</p>
                      <p className="text-sm text-indigo-400">mi</p>
                    </div>
                    <div className="p-6 bg-green-50 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold text-green-700 flex items-center justify-center"><Clock className="mr-2" />Total Hours on Road</h3>
                      <p className="mt-2 text-4xl font-extrabold text-green-600">{logData.reduce((sum, log) => sum + (log.total_hours || 0), 0).toFixed(2)}</p>
                      <p className="text-sm text-green-400">hrs</p>
                    </div>
                    <div className="p-6 bg-yellow-50 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold text-yellow-700 flex items-center justify-center"><Fuel className="mr-2" />Total Fuel Stops</h3>
                      <p className="mt-2 text-4xl font-extrabold text-yellow-600">{logData.reduce((sum, log) => sum + (log.fuel_stops?.length || 0), 0)}</p>
                      <p className="text-sm text-yellow-400">stops</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Past Trips Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Miles</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {logData.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp.toDate()).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{log.formData.origin} to {log.formData.destination}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.formData.driverName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.total_miles.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.total_hours.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <BarChart2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No data to generate reports. Calculate a trip on the Home tab first.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
