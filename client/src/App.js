import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, where, getDocs, setLogLevel, serverTimestamp, getDoc } from 'firebase/firestore';
import { Truck, MapPin, Star, User, Clock, Calendar, Gauge, CheckCircle, XCircle, Locate, Loader, Printer, StickyNote, Fuel, Bed, Database, ListChecks, TrendingUp, Info, Car, FileText, Settings, BarChart2, Book, Plus, Home } from 'lucide-react';
import { debounce } from 'lodash';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Define global variables provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Mapbox token from user's uploaded file
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

// Initialize Firebase
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Set log level for Firebase
if (db) setLogLevel('debug');

function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [currentCycleHours, setCurrentCycleHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [error, setError] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedTrip, setSelectedTrip] = useState(null);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const eldCanvasRef = useRef(null);

  // --- Geocoding and Location Logic ---
  const geocode = async (address) => {
    if (!address) return null;
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`);
      const data = await response.json();
      if (data.features.length > 0) {
        const feature = data.features[0];
        return {
          lng: feature.center[0],
          lat: feature.center[1],
          name: feature.place_name,
        };
      }
      return null;
    } catch (e) {
      console.error("Geocoding failed:", e);
      return null;
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const place = await geocode(`${longitude},${latitude}`);
        if (place) {
          setCurrentLocation(place.name);
        }
        setLoading(false);
      }, (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to retrieve your current location.');
        setLoading(false);
      });
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  // --- Firebase & Firestore Logic ---
  useEffect(() => {
    const initFirebase = async () => {
      if (!app) {
        console.error("Firebase not initialized. Check firebaseConfig.");
        return;
      }
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Firebase auth error:", e);
      }
    };

    if (auth && !userId) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          setIsAuthReady(true);
          console.log(`User authenticated with UID: ${user.uid}`);
        } else {
          console.log("User is signed out.");
          setUserId(null);
          setIsAuthReady(true);
        }
      });
      initFirebase();
      return () => unsubscribe();
    }
  }, [auth, userId, initialAuthToken]);

  useEffect(() => {
    if (isAuthReady && userId && db) {
      const tripsRef = collection(db, 'artifacts', appId, 'users', userId, 'trips');
      const q = query(tripsRef);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const trips = [];
        snapshot.forEach(doc => {
          trips.push({ id: doc.id, ...doc.data() });
        });
        setSavedTrips(trips);
      }, (err) => {
        console.error("Failed to fetch trips:", err);
      });

      return () => unsubscribe();
    }
  }, [isAuthReady, userId, db, appId]);

  const saveTrip = async (data) => {
    if (!userId || !db) {
      setError("Unable to save trip. Authentication failed.");
      return;
    }
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'trips'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      console.log("Trip saved with ID:", docRef.id);
    } catch (e) {
      console.error("Error saving trip:", e);
      setError("Failed to save trip data.");
    } finally {
      setLoading(false);
    }
  };

  // --- Trip & ELD Log Calculation Logic ---
  const calculateTrip = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      if (!currentLocation || !pickupLocation || !dropoffLocation || !currentCycleHours) {
        setError('All fields are required.');
        setLoading(false);
        return;
      }
  
      const origin = await geocode(currentLocation);
      const pickup = await geocode(pickupLocation);
      const dropoff = await geocode(dropoffLocation);
  
      if (!origin || !pickup || !dropoff) {
        setError('One or more locations could not be found.');
        setLoading(false);
        return;
      }
  
      const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const routeResponse = await fetch(routeUrl);
      const routeData = await routeResponse.json();
  
      if (!routeData || !routeData.routes || routeData.routes.length === 0) {
        setError('No route could be found between the specified locations.');
        setLoading(false);
        return;
      }
  
      const route = routeData.routes[0];
      const distance = route.distance / 1609.34; // meters to miles
      const duration = route.duration / 3600; // seconds to hours
      
      // Assumptions from assessment
      const averageSpeed = 60; // mph
      const drivingHours = distance / averageSpeed;
      const onDutyHours = drivingHours + 1; // 1 hr for pickup/drop-off
      const fuelStopsNeeded = Math.floor(distance / 1000);
      const totalTripHours = onDutyHours; // simplified for this calculation
      const remainingCycleHours = Math.max(0, 70 - parseFloat(currentCycleHours));
      const dailyLogSheets = Math.ceil(totalTripHours / 24);
  
      let stops = [];
      let restNeeded = false;
      if (totalTripHours > remainingCycleHours) {
        restNeeded = true;
        const restDuration = totalTripHours - remainingCycleHours;
        stops.push({
          type: 'Rest',
          duration: restDuration.toFixed(2),
          time: new Date().toLocaleTimeString(),
        });
      }
  
      if (fuelStopsNeeded > 0) {
        stops.push({
          type: 'Fuel',
          count: fuelStopsNeeded,
        });
      }
      
      const eldLogData = generateEldLogData(totalTripHours, parseFloat(currentCycleHours));
  
      const newTrip = {
        origin,
        pickup,
        dropoff,
        distance: distance.toFixed(2),
        duration: duration.toFixed(2),
        totalHours: totalTripHours.toFixed(2),
        remainingHours: remainingCycleHours.toFixed(2),
        eldLogData,
        stops,
        routeGeoJSON: route.geometry,
      };
      
      setTripData(newTrip);
      await saveTrip(newTrip);
  
    } catch (e) {
      console.error("Trip calculation error:", e);
      setError("An error occurred during trip calculation.");
    } finally {
      setLoading(false);
    }
  };

  const generateEldLogData = (totalTripHours, currentCycleHours) => {
    const totalAvailableHours = 70;
    const drivingLimit = 11;
    const onDutyLimit = 14;

    let data = [];
    let cumulativeHours = currentCycleHours;

    // Simulate logs for each 24-hour period
    for (let day = 1; day <= Math.ceil(totalTripHours / 24); day++) {
        let driving = 0;
        let onDuty = 0;
        let offDuty = 0;
        let sleeperBerth = 0;

        let hoursLeftInDay = 24;
        let tripHoursRemaining = totalTripHours - (24 * (day - 1));

        // Driving
        if (tripHoursRemaining > 0) {
            driving = Math.min(tripHoursRemaining, drivingLimit, totalAvailableHours - cumulativeHours);
            cumulativeHours += driving;
            hoursLeftInDay -= driving;
        }

        // On Duty (non-driving) - pickup/dropoff
        if (hoursLeftInDay > 0 && day === 1) { // Only on the first day for simplicity
            onDuty = Math.min(1, hoursLeftInDay, onDutyLimit - driving);
            hoursLeftInDay -= onDuty;
        }
        
        // Break for rest if needed
        if (hoursLeftInDay > 0 && cumulativeHours >= 70) {
          sleeperBerth = hoursLeftInDay;
        }

        // Off Duty (remaining time)
        offDuty = Math.max(0, hoursLeftInDay - sleeperBerth);

        data.push({
            day,
            driving: parseFloat(driving.toFixed(2)),
            onDuty: parseFloat(onDuty.toFixed(2)),
            offDuty: parseFloat(offDuty.toFixed(2)),
            sleeperBerth: parseFloat(sleeperBerth.toFixed(2)),
            totalDailyHours: parseFloat((driving + onDuty + offDuty + sleeperBerth).toFixed(2)),
        });
    }
    return data;
  };
  
  // --- Mapbox and Canvas Drawing ---
  useEffect(() => {
    const initializeMap = (center, route) => {
      if (mapRef.current) mapRef.current.remove();
      
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [center.lng, center.lat],
        zoom: 6,
      });

      mapRef.current.on('load', () => {
        new mapboxgl.Marker({ color: 'green' }).setLngLat([route.pickup.lng, route.pickup.lat]).setPopup(new mapboxgl.Popup().setText('Pickup')).addTo(mapRef.current);
        new mapboxgl.Marker({ color: 'red' }).setLngLat([route.dropoff.lng, route.dropoff.lat]).setPopup(new mapboxgl.Popup().setText('Dropoff')).addTo(mapRef.current);
        
        mapRef.current.addSource('route', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': route.routeGeoJSON,
          },
        });

        mapRef.current.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round',
          },
          'paint': {
            'line-color': '#1E40AF',
            'line-width': 6,
          },
        });
      });
    };
    
    const drawELDLog = (logData) => {
      const canvas = eldCanvasRef.current;
      if (!canvas || !logData) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const hoursInDay = 24;
      const blockHeight = 40;
      const margin = 20;
      const xOffset = 50;
      const yOffset = 20;
      const totalWidth = canvas.width - xOffset - margin;
      const hourWidth = totalWidth / hoursInDay;
      
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#333';
      
      const colors = {
        driving: '#1C64F2',
        onDuty: '#FDBA74',
        offDuty: '#34D399',
        sleeperBerth: '#9CA3AF',
      };
      
      // Draw grid lines
      ctx.strokeStyle = '#E5E7EB';
      for (let i = 0; i <= hoursInDay; i++) {
        const x = xOffset + i * hourWidth;
        ctx.beginPath();
        ctx.moveTo(x, yOffset);
        ctx.lineTo(x, yOffset + logData.length * (blockHeight + margin));
        ctx.stroke();
        ctx.fillText(i.toString(), x, yOffset - 5);
      }
      
      // Draw logs
      logData.forEach((log, index) => {
        const y = yOffset + index * (blockHeight + margin);
        
        // Draw bars
        let currentX = xOffset;
        if (log.driving > 0) {
          ctx.fillStyle = colors.driving;
          ctx.fillRect(currentX, y, log.driving * hourWidth, blockHeight);
          currentX += log.driving * hourWidth;
        }
        if (log.onDuty > 0) {
          ctx.fillStyle = colors.onDuty;
          ctx.fillRect(currentX, y, log.onDuty * hourWidth, blockHeight);
          currentX += log.onDuty * hourWidth;
        }
        if (log.offDuty > 0) {
          ctx.fillStyle = colors.offDuty;
          ctx.fillRect(currentX, y, log.offDuty * hourWidth, blockHeight);
          currentX += log.offDuty * hourWidth;
        }
        if (log.sleeperBerth > 0) {
          ctx.fillStyle = colors.sleeperBerth;
          ctx.fillRect(currentX, y, log.sleeperBerth * hourWidth, blockHeight);
        }
        
        // Draw labels
        ctx.fillStyle = '#333';
        ctx.fillText(`Day ${log.day}`, 5, y + blockHeight / 2 + 4);
      });
      
      // Draw legend
      const legendItems = [
        { label: 'Driving', color: colors.driving },
        { label: 'On Duty', color: colors.onDuty },
        { label: 'Off Duty', color: colors.offDuty },
        { label: 'Sleeper Berth', color: colors.sleeperBerth },
      ];
      
      let legendX = xOffset;
      const legendY = yOffset + logData.length * (blockHeight + margin) + 20;
      
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY, 20, 10);
        ctx.fillStyle = '#333';
        ctx.fillText(item.label, legendX + 25, legendY + 9);
        legendX += ctx.measureText(item.label).width + 50;
      });
    };
    
    if (tripData?.routeGeoJSON) {
      initializeMap(tripData.origin, tripData);
      drawELDLog(tripData.eldLogData);
    }
    
  }, [tripData]);
  
  const handleReloadTrip = (trip) => {
    setSelectedTrip(trip);
    setTripData(trip);
    setCurrentPage('trip-details');
  };
  
  // --- UI Components ---
  const renderHome = () => (
    <div className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center flex items-center justify-center gap-2"><Truck size={28} className="text-blue-600" /> Plan Your Trip</h2>
        <form onSubmit={calculateTrip} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
              <div className="relative">
                <input type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} required />
                <button type="button" onClick={getUserLocation} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors">
                  <Locate size={20} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Cycle Used (Hrs)</label>
              <input type="number" step="0.1" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2" value={currentCycleHours} onChange={(e) => setCurrentCycleHours(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
              <input type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Location</label>
              <input type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2" value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader size={20} className="animate-spin" /> : <TrendingUp size={20} />} Calculate Trip
          </button>
        </form>
        {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2"><XCircle size={20} /> {error}</div>}
      </div>
      
      {savedTrips.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><ListChecks size={24} className="text-gray-500" /> Past Trips</h3>
          <div className="space-y-4">
            {savedTrips.map(trip => (
              <div key={trip.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{trip.pickup?.name} to {trip.dropoff?.name}</p>
                  <p className="text-sm text-gray-500">{new Date(trip.createdAt?.toDate()).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleReloadTrip(trip)} className="mt-2 sm:mt-0 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-1">
                  <Info size={16} /> View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  const renderTripDetails = () => (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
            <Home size={18} /> Back to Home
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Trip Details</h2>
        </div>
        
        {selectedTrip ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Info size={20} /> Trip Summary</h3>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p><span className="font-semibold">Distance:</span> {selectedTrip.distance} miles</p>
                  <p><span className="font-semibold">Estimated Driving Time:</span> {selectedTrip.duration} hours</p>
                  <p><span className="font-semibold">Total On-Duty Hours:</span> {selectedTrip.totalHours} hours</p>
                  <p><span className="font-semibold">Remaining Cycle Hours:</span> {selectedTrip.remainingHours} hours</p>
                  <p className="flex items-center gap-2"><span className="font-semibold">Daily Logs Required:</span> {selectedTrip.eldLogData.length} <FileText size={16} /></p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><MapPin size={20} /> Stops & Notes</h3>
                <ul className="mt-2 text-sm text-gray-600 space-y-2">
                  {selectedTrip.stops.map((stop, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {stop.type === 'Fuel' ? <Fuel size={16} className="text-yellow-500 mt-1" /> : <Bed size={16} className="text-indigo-500 mt-1" />}
                      <span>{stop.type === 'Fuel' ? `${stop.count} Fuel Stops` : `Mandatory Rest Stop: ${stop.duration} hours`}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><BarChart2 size={20} /> ELD Daily Log</h3>
                <canvas ref={eldCanvasRef} className="w-full h-auto mt-4 rounded-lg border" width="600" height="200" />
              </div>
            </div>
            
            <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Select a trip from your history to view details.</p>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <script src="https://cdn.tailwindcss.com"></script>
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Truck size={24} /> FleetTrack
          </h1>
          <div className="flex items-center gap-4">
             <div className="text-sm text-gray-200 hidden sm:block">User ID: {userId || 'N/A'}</div>
          </div>
        </div>
      </header>
      
      <main>
        {currentPage === 'home' && renderHome()}
        {currentPage === 'trip-details' && renderTripDetails()}
      </main>
    </div>
  );
}

export default App;
