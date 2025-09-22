import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Calendar, Gauge, CheckCircle, XCircle, Loader, LocateFixed, Info, ArrowRightCircle, LogIn, LogOut, Database } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection } from 'firebase/firestore';

const App = () => {
  const [activeTab, setActiveTab] = useState('plan');
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    currentLocation: '',
    pickupLocation: '',
    dropoffLocation: '',
    cycleUsed: '',
  });
  const [tripData, setTripData] = useState(null);
  const [publicTrips, setPublicTrips] = useState([]);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const mapboxgl = useRef(null);
  const mapInitialized = useRef(false);

  // Constants based on assessment assumptions and HOS rules
  const AVG_SPEED_MPH = 55;
  const MAX_DRIVING_HRS = 11;
  const MAX_ON_DUTY_HRS = 14;
  const MIN_OFF_DUTY_HRS = 10;
  const PICKUP_DROPOFF_TIME_HRS = 1;
  const FUEL_INTERVAL_MILES = 1000;
  
  // Haversine formula to calculate distance between two lat/lon points
  const haversineDistance = (coords1, coords2) => {
    const R = 3958.8; // Radius of the Earth in miles
    const toRadians = (deg) => deg * (Math.PI / 180);
    const lat1 = toRadians(coords1[1]);
    const lon1 = toRadians(coords1[0]);
    const lat2 = toRadians(coords2[1]);
    const lon2 = toRadians(coords2[0]);
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * Calculates a simulated trip and generates daily ELD logs based on HOS rules.
   * @param {number[]} pickupCoords - [longitude, latitude] of pickup location.
   * @param {number[]} dropoffCoords - [longitude, latitude] of dropoff location.
   * @param {number} initialCycleUsed - The driver's current cycle used hours.
   * @returns {object} An object with trip and log details.
   */
  const calculateTripAndLogs = (pickupCoords, dropoffCoords, initialCycleUsed) => {
    const totalDistance = haversineDistance(pickupCoords, dropoffCoords);
    let totalDrivingTime = totalDistance / AVG_SPEED_MPH;
    let dailyLogs = [];
    let stops = [];
    let totalOnDutyTime = PICKUP_DROPOFF_TIME_HRS; // Start with pickup time
    let totalOffDutyTime = 0;
    let remainingDriving = totalDrivingTime;
    let days = 0;
    let fuelNeeded = Math.floor(totalDistance / FUEL_INTERVAL_MILES);
    
    // Add initial pickup stop
    stops.push({ type: 'pickup', location: formData.pickupLocation, coords: pickupCoords });

    while (remainingDriving > 0) {
      days++;
      let dailyLog = { day: days, driving: 0, onDuty: 0, offDuty: 0, sleeperBerth: 0 };
      let drivingToday = Math.min(remainingDriving, MAX_DRIVING_HRS);
      
      dailyLog.driving = drivingToday;
      remainingDriving -= drivingToday;
      dailyLog.onDuty = drivingToday;
      totalOnDutyTime += drivingToday;
      
      // Add a mandatory break if driving for more than 8 hours
      if (drivingToday > 8) {
          dailyLog.offDuty += 0.5;
          totalOffDutyTime += 0.5;
      }
      
      // Check if a fuel stop is needed and add time for it
      const drivenMilesToday = drivingToday * AVG_SPEED_MPH;
      if (fuelNeeded > 0) {
          dailyLog.onDuty += 0.5; // 30 mins for fueling
          totalOnDutyTime += 0.5;
          fuelNeeded--;
      }

      // Add rest break for the night
      if (remainingDriving > 0) {
        dailyLog.offDuty += MIN_OFF_DUTY_HRS;
        totalOffDutyTime += MIN_OFF_DUTY_HRS;
        
        // Add a stop for the rest
        const midpointCoords = [
          pickupCoords[0] + (dropoffCoords[0] - pickupCoords[0]) * ((totalDrivingTime - remainingDriving) / totalDrivingTime),
          pickupCoords[1] + (dropoffCoords[1] - pickupCoords[1]) * ((totalDrivingTime - remainingDriving) / totalDrivingTime),
        ];
        stops.push({ type: 'rest', location: `Rest Stop Day ${days}`, coords: midpointCoords });
      }

      dailyLogs.push(dailyLog);
    }
    
    // Add final dropoff stop
    stops.push({ type: 'dropoff', location: formData.dropoffLocation, coords: dropoffCoords });
    totalOnDutyTime += PICKUP_DROPOFF_TIME_HRS;

    return {
      distance: totalDistance.toFixed(2),
      estimatedTime: (totalOnDutyTime + totalOffDutyTime).toFixed(2),
      dailyLogs: dailyLogs,
      stops: stops
    };
  };

  const getCoordinates = async (address) => {
    // This is a placeholder for a real geocoding API call.
    // In a real app, you would fetch real coordinates from a service like Mapbox or Google Maps.
    const geocodedCoords = {
      'New York, NY': [-74.0060, 40.7128],
      'Los Angeles, CA': [-118.2437, 34.0522],
      'Chicago, IL': [-87.6298, 41.8781],
      'Houston, TX': [-95.3698, 29.7604],
      'Phoenix, AZ': [-112.074, 33.4484],
    };
    return geocodedCoords[address] || [Math.random() * -180, Math.random() * 90];
  };

  const handlePlanTrip = async () => {
    setMessage(null);
    setIsLoading(true);
    if (!formData.pickupLocation || !formData.dropoffLocation) {
      setMessage({ type: 'error', text: 'Pickup and dropoff locations are required.' });
      setIsLoading(false);
      return;
    }
    
    try {
      const pickupCoords = await getCoordinates(formData.pickupLocation);
      const dropoffCoords = await getCoordinates(formData.dropoffLocation);
      const trip = calculateTripAndLogs(pickupCoords, dropoffCoords, parseFloat(formData.cycleUsed) || 0);
      setTripData(trip);
      setMessage({ type: 'success', text: 'Trip planned successfully! Check the "Trips" and "Logs" tabs.' });

      if (db && userId) {
        const userTripCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/trips`);
        await addDoc(userTripCollectionRef, { ...trip, formData, userId, timestamp: new Date() });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error planning trip. Please try again.' });
      console.error('Error planning trip:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const drawLogOnCanvas = (canvasId, logData) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const PADDING = 20;
    const LOG_HEIGHT = 150;
    const LOG_WIDTH = canvas.width - (2 * PADDING);
    const HOURS = 24;
    const hourlyWidth = LOG_WIDTH / HOURS;

    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;

    // Draw grid lines
    for (let i = 0; i <= HOURS; i++) {
      ctx.beginPath();
      ctx.moveTo(PADDING + i * hourlyWidth, PADDING);
      ctx.lineTo(PADDING + i * hourlyWidth, PADDING + LOG_HEIGHT);
      ctx.stroke();

      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Inter';
      if (i % 2 === 0) {
        ctx.fillText(i, PADDING + i * hourlyWidth - 4, PADDING - 5);
      }
    }

    // Define status bars and colors
    const statuses = ['Driving', 'On Duty', 'Sleeper Berth', 'Off Duty'];
    const statusY = [0, 25, 50, 75];
    const statusColors = {
      'Driving': '#2563eb', // Blue-600
      'On Duty': '#16a34a', // Green-600
      'Sleeper Berth': '#facc15', // Yellow-400
      'Off Duty': '#94a3b8', // Slate-400
    };
    
    let timeLogged = 0;
    const logEntries = [
      { status: 'Driving', duration: logData.driving },
      { status: 'On Duty', duration: logData.onDuty - logData.driving },
      { status: 'Sleeper Berth', duration: logData.sleeperBerth },
      { status: 'Off Duty', duration: logData.offDuty },
    ];
    
    // Draw rectangles for each status based on time
    let currentX = PADDING;
    for (const entry of logEntries) {
        if (entry.duration > 0) {
            const width = entry.duration * hourlyWidth;
            const yOffset = PADDING + statusY[statuses.indexOf(entry.status)];
            ctx.fillStyle = statusColors[entry.status];
            ctx.fillRect(currentX, yOffset, width, 20);
            currentX += width;
        }
    }

    // Draw status labels
    const labels = ['Driving', 'On Duty', 'Sleeper', 'Off Duty'];
    for (let i = 0; i < statuses.length; i++) {
      ctx.fillStyle = statusColors[statuses[i]];
      ctx.fillRect(PADDING - 15, PADDING + statusY[i], 10, 10);
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Inter';
      ctx.fillText(labels[i], PADDING + 10, PADDING + statusY[i] + 10);
    }
  };
  
  // Firebase and Auth Initialization
  useEffect(() => {
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const app = initializeApp(firebaseConfig);
    const firestoreDb = getFirestore(app);
    const firebaseAuth = getAuth(app);
    setDb(firestoreDb);
    setAuth(firebaseAuth);

    const checkAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(firebaseAuth, __initial_auth_token);
        } else {
          await signInAnonymously(firebaseAuth);
        }
      } catch (error) {
        console.error("Firebase auth error:", error);
      }
      setIsAuthReady(true);
    };
    
    checkAuth();

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Firestore Data Subscription
  useEffect(() => {
    if (db && userId) {
      const publicTripsRef = collection(db, `artifacts/${__app_id}/public/data/trips`);
      const unsubscribePublic = onSnapshot(publicTripsRef, (snapshot) => {
        const trips = [];
        snapshot.forEach(doc => trips.push({ id: doc.id, ...doc.data() }));
        setPublicTrips(trips);
      });
      return () => unsubscribePublic();
    }
  }, [db, userId]);

  // Mapbox Initialization and Data Drawing
  useEffect(() => {
    if (activeTab === 'trips' && tripData && mapContainer.current && !mapInitialized.current) {
      // Load Mapbox GL JS dynamically
      const mapboxScript = document.createElement('script');
      mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js';
      mapboxScript.onload = () => {
        mapboxgl.current = window.mapboxgl;
        mapboxgl.current.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iczBscDB2em9jZjQyaGYwcmkifQ._1EuZ-gc-p3LB-x_o-Mvvw'; // Placeholder key

        map.current = new mapboxgl.current.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: tripData.stops[0].coords,
          zoom: 5
        });

        map.current.on('load', () => {
          const coordinates = tripData.stops.map(stop => stop.coords);

          tripData.stops.forEach(stop => {
            new mapboxgl.current.Marker()
              .setLngLat(stop.coords)
              .setPopup(new mapboxgl.current.Popup({ offset: 25 }).setHTML(
                `<div class="font-bold text-gray-800">${stop.type.charAt(0).toUpperCase() + stop.type.slice(1)} Stop</div><div class="text-sm text-gray-600">${stop.location}</div>`
              ))
              .addTo(map.current);
          });

          map.current.addSource('route', {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
              }
            }
          });

          map.current.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': { 'line-join': 'round', 'line-cap': 'round' },
            'paint': { 'line-color': '#4f46e5', 'line-width': 6, 'line-opacity': 0.7 }
          });
          mapInitialized.current = true;
        });
      };
      document.head.appendChild(mapboxScript);

      // Load Mapbox GL CSS dynamically
      const mapboxCss = document.createElement('link');
      mapboxCss.href = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css';
      mapboxCss.rel = 'stylesheet';
      document.head.appendChild(mapboxCss);

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
        mapInitialized.current = false;
      };
    }
  }, [activeTab, tripData]);

  // Canvas Drawing for ELD Logs
  useEffect(() => {
    if (activeTab === 'logs' && tripData) {
      tripData.dailyLogs.forEach((log, index) => {
        drawLogOnCanvas(`log-canvas-${index}`, log);
      });
    }
  }, [activeTab, tripData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearMessage = () => {
    setMessage(null);
  };
  
  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({ ...prev, currentLocation: `${position.coords.latitude}, ${position.coords.longitude}` }));
          setMessage({ type: 'success', text: 'Current location found!' });
          setIsLocating(false);
        },
        (error) => {
          setMessage({ type: 'error', text: 'Unable to retrieve location.' });
          setIsLocating(false);
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      setIsLocating(false);
    }
  };

  const renderContent = () => {
    if (!isAuthReady) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader className="animate-spin text-indigo-600" />
          <span className="ml-2 text-lg text-gray-700">Loading application...</span>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'plan':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Plan a New Trip</h2>
            <form onSubmit={(e) => { e.preventDefault(); handlePlanTrip(); }} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1" htmlFor="currentLocation">
                    Current Location
                  </label>
                  <div className="relative">
                    <input
                      id="currentLocation"
                      name="currentLocation"
                      type="text"
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 pr-10"
                      value={formData.currentLocation}
                      onChange={handleInputChange}
                      placeholder="e.g., Chicago, IL"
                      disabled={isLocating || isLoading}
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                      disabled={isLocating || isLoading}
                    >
                      {isLocating ? <Loader className="animate-spin" size={20} /> : <LocateFixed size={20} />}
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1" htmlFor="pickupLocation">
                    Pickup Location
                  </label>
                  <input
                    id="pickupLocation"
                    name="pickupLocation"
                    type="text"
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    value={formData.pickupLocation}
                    onChange={handleInputChange}
                    placeholder="e.g., Los Angeles, CA"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1" htmlFor="dropoffLocation">
                    Dropoff Location
                  </label>
                  <input
                    id="dropoffLocation"
                    name="dropoffLocation"
                    type="text"
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    value={formData.dropoffLocation}
                    onChange={handleInputChange}
                    placeholder="e.g., New York, NY"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1" htmlFor="cycleUsed">
                    Current Cycle Used (Hrs)
                  </label>
                  <input
                    id="cycleUsed"
                    name="cycleUsed"
                    type="number"
                    min="0"
                    max="70"
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    value={formData.cycleUsed}
                    onChange={handleInputChange}
                    placeholder="e.g., 20"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md shadow-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? <Loader className="animate-spin mr-2" /> : <ArrowRightCircle className="mr-2" />}
                Plan Trip
              </button>
            </form>
            {message && (
              <div className={`mt-6 p-4 rounded-md flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
                <span>{message.text}</span>
              </div>
            )}
          </div>
        );
      case 'trips':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Trip & Route</h2>
            {tripData ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                  <p className="font-semibold text-gray-700">
                    <MapPin className="inline mr-2" size={16} />
                    From: <span className="text-indigo-600">{formData.pickupLocation}</span> to <span className="text-indigo-600">{formData.dropoffLocation}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    <Gauge className="inline mr-2" size={16} />
                    Distance: <span className="font-semibold">{tripData.distance} mi</span>
                    <span className="ml-4"><Calendar className="inline mr-2" size={16} />Estimated Time: <span className="font-semibold">{tripData.estimatedTime} hrs</span></span>
                  </p>
                </div>
                <div id="map" ref={mapContainer} className="w-full h-96 rounded-lg shadow-md"></div>
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <Info size={48} className="mx-auto mb-4" />
                <p>No trip data to display. Plan a trip on the "Plan Trip" tab.</p>
              </div>
            )}
          </div>
        );
      case 'logs':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily ELD Logs</h2>
            {tripData ? (
              <div className="space-y-8">
                {tripData.dailyLogs.map((log, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Day {index + 1} Log Sheet</h3>
                    <div className="grid grid-cols-2 gap-2 text-gray-700 mb-4">
                      <p><strong>Driving:</strong> {log.driving.toFixed(2)} hrs</p>
                      <p><strong>On Duty:</strong> {log.onDuty.toFixed(2)} hrs</p>
                      <p><strong>Sleeper:</strong> {log.sleeperBerth.toFixed(2)} hrs</p>
                      <p><strong>Off Duty:</strong> {log.offDuty.toFixed(2)} hrs</p>
                    </div>
                    <canvas id={`log-canvas-${index}`} width="800" height="200" className="mt-4 border rounded-md"></canvas>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <Info size={48} className="mx-auto mb-4" />
                <p>No log data to display. Plan a trip on the "Plan Trip" tab.</p>
              </div>
            )}
          </div>
        );
      case 'public-trips':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Public Trips</h2>
            <div className="text-sm text-gray-600 mb-4">
              <span className="font-semibold">Your User ID:</span> <span className="font-mono">{userId}</span>
            </div>
            {publicTrips.length > 0 ? (
              <div className="space-y-4">
                {publicTrips.map((trip) => (
                  <div key={trip.id} className="bg-white p-4 rounded-lg shadow-md">
                    <p className="font-semibold text-gray-800">Trip from: {trip.formData.pickupLocation}</p>
                    <p className="font-semibold text-gray-800">Trip to: {trip.formData.dropoffLocation}</p>
                    <p className="text-sm text-gray-600">Distance: {trip.distance} mi</p>
                    <p className="text-sm text-gray-600 font-mono">User ID: {trip.userId}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <Info size={48} className="mx-auto mb-4" />
                <p>No public trip data available.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const navItemClass = (tab) =>
    `px-4 py-2 rounded-full transition-colors duration-200 ${
      activeTab === tab
        ? 'bg-indigo-600 text-white shadow-md'
        : 'text-gray-600 hover:text-indigo-600'
    }`;
  
  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased flex flex-col">
      <div className="bg-white shadow-lg p-4 flex flex-col md:flex-row justify-between items-center fixed top-0 left-0 w-full z-10">
        <div className="flex items-center space-x-2">
          <Truck className="text-indigo-600" size={32} />
          <h1 className="text-2xl font-extrabold text-gray-800">
            Trip Planner
          </h1>
        </div>
        <nav className="mt-4 md:mt-0">
          <ul className="flex space-x-2 md:space-x-4 text-sm md:text-base">
            <li><button onClick={() => setActiveTab('plan')} className={navItemClass('plan')}>Plan Trip</button></li>
            <li><button onClick={() => setActiveTab('trips')} className={navItemClass('trips')}>Trips</button></li>
            <li><button onClick={() => setActiveTab('logs')} className={navItemClass('logs')}>Logs</button></li>
            <li><button onClick={() => setActiveTab('public-trips')} className={navItemClass('public-trips')}>Public Trips</button></li>
          </ul>
        </nav>
      </div>

      <main className="flex-1 container mx-auto p-4 md:p-8 pt-24">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {renderContent()}
        </div>
      </main>

      {/* Tailwind CSS Script CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
    </div>
  );
};

export default App;
