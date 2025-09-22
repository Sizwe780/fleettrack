import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Star, User, Clock, Calendar, Gauge, CheckCircle, XCircle, Locate, Loader, Printer, StickyNote, Fuel, Bed, Database, ListChecks, TrendingUp, Info, Car, FileText, Settings, BarChart2, Book, Plus, Home, Wrench, DollarSign, Users, MessageSquare, Shield, AlertTriangle, BatteryCharging, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, where, getDocs, setLogLevel, serverTimestamp, setDoc } from 'firebase/firestore';
import axios from 'axios';

// The Mapbox GL JS library is loaded via a CDN link in the main HTML file,
// so we don't need to import it here. The `mapboxgl` object will be
// available globally.

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

// Set log level for Firestore
if (db) {
  setLogLevel('debug');
}

// Haversine formula to calculate distance between two lat/lng points
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c / 1609.34; // convert to miles
}

const getLocationName = async (lng, lat) => {
  try {
    const res = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`, {
      params: { access_token: MAPBOX_ACCESS_TOKEN },
    });
    return res.data.features[0]?.place_name || `${lat}, ${lng}`;
  } catch (err) {
    console.error('Reverse geocoding failed:', err);
    return `${lat}, ${lng}`;
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [newTrip, setNewTrip] = useState({ origin: '', destination: '', currentCycleUsed: 0 });
  const [newExpense, setNewExpense] = useState({ date: '', category: 'Fuel', amount: '', notes: '' });
  const [newMaintenance, setNewMaintenance] = useState({ date: '', description: '', cost: '' });
  const [tripResult, setTripResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
      } else {
        await signInAnonymously(auth);
        setUserId(auth.currentUser?.uid || crypto.randomUUID());
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [auth, db]);

  useEffect(() => {
    if (!db || !user || !isAuthReady) return;

    // Listen for trips
    const tripsColRef = collection(db, `artifacts/${appId}/public/data/trips`);
    const tripsUnsubscribe = onSnapshot(tripsColRef, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tripResult: doc.data().tripResult ? JSON.parse(doc.data().tripResult) : null
      }));
      setTrips(tripsData.sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis()));
    });

    // Listen for expenses
    const expensesColRef = collection(db, `artifacts/${appId}/users/${userId}/expenses`);
    const expensesUnsubscribe = onSnapshot(expensesColRef, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });

    // Listen for maintenance logs
    const maintenanceColRef = collection(db, `artifacts/${appId}/users/${userId}/maintenance`);
    const maintenanceUnsubscribe = onSnapshot(maintenanceColRef, (snapshot) => {
      const maintenanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaintenance(maintenanceData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });

    return () => {
      tripsUnsubscribe();
      expensesUnsubscribe();
      maintenanceUnsubscribe();
    };
  }, [db, user, isAuthReady, userId]);

  const showModal = (message) => {
    setModalContent(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTrip({ ...newTrip, [name]: value });
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  const handleMaintenanceChange = (e) => {
    const { name, value } = e.target;
    setNewMaintenance({ ...newMaintenance, [name]: value });
  };

  const handleCoordinateSearch = async (location, setCoords) => {
    try {
      const res = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json`, {
        params: { access_token: MAPBOX_ACCESS_TOKEN },
      });
      if (res.data.features && res.data.features.length > 0) {
        const coords = { lng: res.data.features[0].center[0], lat: res.data.features[0].center[1] };
        setCoords(coords);
        return coords;
      }
      return null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  };

  const handleSubmitTrip = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTripResult(null);

    if (!newTrip.origin || !newTrip.destination) {
      showModal('Please enter both origin and destination.');
      setIsLoading(false);
      return;
    }

    const originCoords = await handleCoordinateSearch(newTrip.origin, setOriginCoords);
    const destCoords = await handleCoordinateSearch(newTrip.destination, setDestCoords);

    if (!originCoords || !destCoords) {
      showModal('Could not find coordinates for origin or destination.');
      setIsLoading(false);
      return;
    }

    try {
      const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await axios.get(url);

      const tripData = response.data.trips[0];
      const totalDistanceMiles = tripData.distance / 1609.34;
      const totalDurationHours = tripData.duration / 3600;

      const dailyHours = 11;
      const restHours = 10;
      const onDutyBuffer = 2; // 1 hour for each pickup/dropoff
      const maxDrivingMiles = dailyHours * 60; // Assuming 60 mph average

      const logDays = [];
      let remainingDistance = totalDistanceMiles;
      let totalDrivingHours = 0;
      let fuelStopsNeeded = 0;
      const milesBetweenStops = 1000;

      while (remainingDistance > 0) {
        const drivingMiles = Math.min(remainingDistance, maxDrivingMiles);
        const drivingHours = drivingMiles / 60;
        totalDrivingHours += drivingHours;
        const totalOnDutyHours = drivingHours + onDutyBuffer;
        const totalOffDutyHours = restHours;

        logDays.push({
          date: new Date().toISOString().split('T')[0],
          drivingHours: drivingHours.toFixed(2),
          onDutyHours: totalOnDutyHours.toFixed(2),
          offDutyHours: totalOffDutyHours.toFixed(2),
          miles: drivingMiles.toFixed(2),
        });

        remainingDistance -= drivingMiles;
      }

      fuelStopsNeeded = Math.floor(totalDistanceMiles / milesBetweenStops);

      const calculatedResult = {
        totalDistanceMiles: totalDistanceMiles.toFixed(2),
        totalDurationHours: totalDurationHours.toFixed(2),
        totalDrivingHours: totalDrivingHours.toFixed(2),
        totalFuelStops: fuelStopsNeeded,
        dailyLogs: logDays,
      };

      setTripResult(calculatedResult);

      const tripDocRef = doc(collection(db, `artifacts/${appId}/public/data/trips`));
      await setDoc(tripDocRef, {
        origin: newTrip.origin,
        destination: newTrip.destination,
        currentCycleUsed: parseFloat(newTrip.currentCycleUsed),
        tripResult: JSON.stringify(calculatedResult),
        userId: userId,
        timestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error('Error calculating trip:', error);
      showModal('Failed to calculate trip details. Please check the locations.');
    } finally {
      setIsLoading(false);
      setCurrentView('results');
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.date || !newExpense.amount || !newExpense.category) {
      showModal('Please fill out all required fields for the expense.');
      return;
    }
    const expenseDocRef = collection(db, `artifacts/${appId}/users/${userId}/expenses`);
    await addDoc(expenseDocRef, { ...newExpense, amount: parseFloat(newExpense.amount), timestamp: serverTimestamp() });
    setNewExpense({ date: '', category: 'Fuel', amount: '', notes: '' });
  };

  const handleSubmitMaintenance = async (e) => {
    e.preventDefault();
    if (!newMaintenance.date || !newMaintenance.description || !newMaintenance.cost) {
      showModal('Please fill out all required fields for maintenance.');
      return;
    }
    const maintenanceDocRef = collection(db, `artifacts/${appId}/users/${userId}/maintenance`);
    await addDoc(maintenanceDocRef, { ...newMaintenance, cost: parseFloat(newMaintenance.cost), timestamp: serverTimestamp() });
    setNewMaintenance({ date: '', description: '', cost: '' });
  };

  useEffect(() => {
    if (!originCoords || !destCoords || currentView !== 'results') return;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [originCoords.lng, originCoords.lat],
      zoom: 6,
    });

    mapRef.current.on('load', async () => {
      new mapboxgl.Marker({ color: 'green' }).setLngLat([originCoords.lng, originCoords.lat]).setPopup(new mapboxgl.Popup().setText(newTrip.origin)).addTo(mapRef.current);
      new mapboxgl.Marker({ color: 'blue' }).setLngLat([destCoords.lng, destCoords.lat]).setPopup(new mapboxgl.Popup().setText(newTrip.destination)).addTo(mapRef.current);

      try {
        const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?access_token=${MAPBOX_ACCESS_TOKEN}`;
        const response = await axios.get(url);
        const coordinates = response.data.trips[0].geometry.coordinates;

        mapRef.current.addSource('route', { 'type': 'geojson', 'data': { 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': coordinates } } });
        mapRef.current.addLayer({ 'id': 'route', 'type': 'line', 'source': 'route', 'layout': { 'line-join': 'round', 'line-cap': 'round' }, 'paint': { 'line-color': '#888', 'line-width': 8 } });
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => { bounds.extend(coord); });
        mapRef.current.fitBounds(bounds, { padding: 50 });
      } catch (error) {
        console.error('Failed to draw route:', error);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [currentView, originCoords, destCoords]);

  const renderContent = () => {
    if (!isAuthReady) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <Loader className="animate-spin text-gray-500" size={48} />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'home':
        return (
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Trip Planner</h1>
              <p className="mt-2 text-lg text-gray-600">Calculate routes and generate ELD logs.</p>
            </div>
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
              <form onSubmit={handleSubmitTrip} className="space-y-6">
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origin</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="origin"
                      name="origin"
                      value={newTrip.origin}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5"
                      placeholder="Enter a starting point..."
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      value={newTrip.destination}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5"
                      placeholder="Enter a destination..."
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="currentCycleUsed" className="block text-sm font-medium text-gray-700">Current Cycle Used (Hrs)</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="currentCycleUsed"
                      name="currentCycleUsed"
                      value={newTrip.currentCycleUsed}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5"
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Calculating...' : 'Calculate Trip'}
                </button>
              </form>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold text-center text-gray-800">Trip Plan and ELD Logs</h2>
            {tripResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Map Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 h-96 relative">
                  <div ref={mapContainer} className="w-full h-full rounded-xl" />
                  <p className="absolute bottom-4 left-4 z-10 text-xs text-gray-500">
                    <Star className="inline-block w-3 h-3 text-yellow-400 mr-1" /> Fuel stops are estimates every 1,000 miles.
                  </p>
                </div>

                {/* Summary & Logs Section */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Trip Summary</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <li className="flex items-center text-gray-600">
                        <Gauge className="w-5 h-5 mr-2 text-indigo-500" />
                        <span className="font-semibold">Distance:</span> {tripResult.totalDistanceMiles} miles
                      </li>
                      <li className="flex items-center text-gray-600">
                        <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                        <span className="font-semibold">Est. Duration:</span> {tripResult.totalDurationHours} hours
                      </li>
                      <li className="flex items-center text-gray-600">
                        <Truck className="w-5 h-5 mr-2 text-indigo-500" />
                        <span className="font-semibold">Driving Hours:</span> {tripResult.totalDrivingHours} hours
                      </li>
                      <li className="flex items-center text-gray-600">
                        <Fuel className="w-5 h-5 mr-2 text-indigo-500" />
                        <span className="font-semibold">Fuel Stops:</span> {tripResult.totalFuelStops}
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">ELD Daily Logs</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driving (Hrs)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Duty (Hrs)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Off-Duty (Hrs)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miles</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tripResult.dailyLogs.map((log, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.drivingHours}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.onDutyHours}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.offDutyHours}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.miles}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="text-center mt-8">
              <button
                onClick={() => setCurrentView('home')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
              >
                <Plus className="w-5 h-5 mr-2" /> New Trip
              </button>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Trip History</h2>
            <div className="space-y-6">
              {trips.length > 0 ? (
                trips.map((trip) => (
                  <div key={trip.id} className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold text-gray-800">Trip from {trip.origin} to {trip.destination}</h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {trip.timestamp ? new Date(trip.timestamp.toDate()).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {trip.tripResult && (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        <li className="flex items-center"><Gauge className="w-4 h-4 mr-2" />{trip.tripResult.totalDistanceMiles} miles</li>
                        <li className="flex items-center"><Clock className="w-4 h-4 mr-2" />{trip.tripResult.totalDurationHours} hours</li>
                        <li className="flex items-center"><Fuel className="w-4 h-4 mr-2" />{trip.tripResult.totalFuelStops} fuel stops</li>
                      </ul>
                    )}
                    <button
                      onClick={() => {
                        setOriginCoords(null);
                        setDestCoords(null);
                        setNewTrip({ origin: trip.origin, destination: trip.destination, currentCycleUsed: trip.currentCycleUsed });
                        setTripResult(trip.tripResult);
                        setCurrentView('results');
                      }}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 transition duration-300"
                    >
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">No trips logged yet. Start a new trip!</div>
              )}
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Expense Tracker</h2>
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800">Add New Expense</h3>
              <form onSubmit={handleSubmitExpense} className="space-y-4">
                <div>
                  <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700">Date</label>
                  <input type="date" id="expenseDate" name="date" value={newExpense.date} onChange={handleExpenseChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5" required />
                </div>
                <div>
                  <label htmlFor="expenseCategory" className="block text-sm font-medium text-gray-700">Category</label>
                  <select id="expenseCategory" name="category" value={newExpense.category} onChange={handleExpenseChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5">
                    <option>Fuel</option>
                    <option>Tolls</option>
                    <option>Food</option>
                    <option>Lodging</option>
                    <option>Repairs</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700">Amount ($)</label>
                  <input type="number" step="0.01" id="expenseAmount" name="amount" value={newExpense.amount} onChange={handleExpenseChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5" required />
                </div>
                <div>
                  <label htmlFor="expenseNotes" className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea id="expenseNotes" name="notes" rows="3" value={newExpense.notes} onChange={handleExpenseChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5"></textarea>
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Add Expense
                </button>
              </form>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Expense History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.length > 0 ? (
                      expenses.map((exp) => (
                        <tr key={exp.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exp.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exp.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${exp.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exp.notes}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No expenses logged yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Maintenance Log</h2>
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800">Add New Service</h3>
              <form onSubmit={handleSubmitMaintenance} className="space-y-4">
                <div>
                  <label htmlFor="maintDate" className="block text-sm font-medium text-gray-700">Date</label>
                  <input type="date" id="maintDate" name="date" value={newMaintenance.date} onChange={handleMaintenanceChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5" required />
                </div>
                <div>
                  <label htmlFor="maintDesc" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea id="maintDesc" name="description" rows="3" value={newMaintenance.description} onChange={handleMaintenanceChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5" required></textarea>
                </div>
                <div>
                  <label htmlFor="maintCost" className="block text-sm font-medium text-gray-700">Cost ($)</label>
                  <input type="number" step="0.01" id="maintCost" name="cost" value={newMaintenance.cost} onChange={handleMaintenanceChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5" required />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Log Service
                </button>
              </form>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Service History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {maintenance.length > 0 ? (
                      maintenance.map((maint) => (
                        <tr key={maint.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{maint.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maint.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${maint.cost.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No maintenance logged yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 antialiased">
      <style>{`
        .mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right {
          display: none !important;
        }
      `}</style>
      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <nav className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out bg-gray-800 text-white w-64 p-4 md:p-6 flex flex-col`}>
          <div className="flex items-center justify-between md:justify-center mb-8">
            <div className="flex items-center">
              <Truck className="w-8 h-8 mr-2 text-indigo-400" />
              <span className="text-xl font-bold">Logtrack</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => { setCurrentView('home'); setSidebarOpen(false); }}
              className={`flex items-center py-2 px-4 rounded-lg transition duration-200 ${currentView === 'home' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
            >
              <Home className="w-5 h-5 mr-2" />
              <span>Home</span>
            </button>
            <button
              onClick={() => { setCurrentView('history'); setSidebarOpen(false); }}
              className={`flex items-center py-2 px-4 rounded-lg transition duration-200 ${currentView === 'history' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
            >
              <ListChecks className="w-5 h-5 mr-2" />
              <span>Trip History</span>
            </button>
            <button
              onClick={() => { setCurrentView('expenses'); setSidebarOpen(false); }}
              className={`flex items-center py-2 px-4 rounded-lg transition duration-200 ${currentView === 'expenses' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              <span>Expenses</span>
            </button>
            <button
              onClick={() => { setCurrentView('maintenance'); setSidebarOpen(false); }}
              className={`flex items-center py-2 px-4 rounded-lg transition duration-200 ${currentView === 'maintenance' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
            >
              <Wrench className="w-5 h-5 mr-2" />
              <span>Maintenance</span>
            </button>
          </div>
          <div className="mt-auto text-sm text-gray-400 p-4 rounded-lg bg-gray-700 break-all">
            <p className="font-semibold">User ID:</p>
            <p className="font-mono mt-1">{userId}</p>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 pt-16 md:pt-4 overflow-auto">
          <header className="flex items-center justify-between md:hidden p-4 bg-white shadow-md rounded-lg mb-4 fixed top-0 left-0 right-0 z-40">
            <div className="flex items-center space-x-2">
              <Truck className="w-6 h-6 text-indigo-500" />
              <h1 className="text-xl font-bold">Logtrack</h1>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </header>
          {renderContent()}
        </main>
      </div>

      {/* Modal for User Messages */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm mx-auto transform transition-all scale-100 duration-300">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Notification</h4>
            <p className="text-gray-700 mb-6">{modalContent}</p>
            <button
              onClick={closeModal}
              className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
