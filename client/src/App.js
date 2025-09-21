import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Star, User, Clock, Calendar, Gauge, CheckCircle, XCircle, Locate, Loader, Printer, StickyNote, Fuel, Bed, Database, ListChecks, TrendingUp, Info } from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, orderBy, where, getDocs, setLogLevel } from 'firebase/firestore';

const App = () => {
  // State management for UI tabs and form data
  const [activeTab, setActiveTab] = useState('home');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    driverName: '',
    departureDate: '',
    departureTime: '',
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

  // Firestore and Mapbox references
  const dbRef = useRef(null);
  const authRef = useRef(null);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const logCanvasRefs = useRef([]);

  // Global variables from the environment
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
  const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFudWVsYXJvc2VybyIsImEiOiJjbHhxNHB4ajEwc3d4Mmlyd3RjdHB4d2E1In0.niS9m5pCbK5Kv-_On2mTcg';


  // --- Firebase Initialization and Authentication ---
  useEffect(() => {
    if (Object.keys(firebaseConfig).length > 0) {
      const app = initializeApp(firebaseConfig);
      dbRef.current = getFirestore(app);
      authRef.current = getAuth(app);
      setLogLevel('debug');

      const unsubscribe = onAuthStateChanged(authRef.current, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(authRef.current, initialAuthToken);
            } else {
              await signInAnonymously(authRef.current);
            }
          } catch (e) {
            console.error("Firebase auth error:", e);
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
        setLogData(trips[0].logSheets || []);
        setFormData({
          driverName: trips[0].driverName,
          departureDate: trips[0].departureDate,
          departureTime: trips[0].departureTime,
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

    const originCoords = [-122.4194, 37.7749];
    const destinationCoords = [-74.0060, 40.7128];

    // Add trip markers
    const originMarker = new window.mapboxgl.Marker({ color: 'green' })
      .setLngLat(originCoords)
      .setPopup(new window.mapboxgl.Popup().setHTML(`
        <div class="font-bold text-sm">Pickup Location</div>
        <div class="text-xs">${mapData.origin}</div>
      `))
      .addTo(mapRef.current);

    const destinationMarker = new window.mapboxgl.Marker({ color: 'red' })
      .setLngLat(destinationCoords)
      .setPopup(new window.mapboxgl.Popup().setHTML(`
        <div class="font-bold text-sm">Dropoff Location</div>
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
    if (activeTab !== 'logs' || !logData || logData.length === 0) return;

    logCanvasRefs.current.forEach((canvas, dayIndex) => {
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const hourWidth = width / 24;
      const statusHeight = height / 4;

      ctx.clearRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#6b7280';
      for (let i = 0; i <= 24; i++) {
        ctx.beginPath();
        ctx.moveTo(i * hourWidth, 0);
        ctx.lineTo(i * hourWidth, height);
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillText(i, i * hourWidth, height - 5);
      }

      // Draw status labels
      const statusLabels = ['Off Duty', 'Sleeper', 'Driving', 'On Duty'];
      ctx.textAlign = 'left';
      statusLabels.forEach((label, i) => {
        ctx.fillText(label, 5, i * statusHeight + statusHeight / 2);
      });

      // Map status to canvas y-coordinate
      const statusMap = {
        'Off Duty': 0,
        'Sleeper': 1,
        'Driving': 2,
        'On Duty': 3
      };

      // Draw log events
      ctx.lineWidth = 4;
      logData[dayIndex].forEach(event => {
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
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });
          setFormData(prev => ({
            ...prev,
            origin: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          }));
          setMessage('Location found and set as Origin!');
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
    if (!formData.origin || !formData.destination || !formData.cycleUsed || !formData.driverName || !formData.departureDate || !formData.departureTime) {
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

    const DISTANCE = 1500; // Simulated trip distance
    const AVG_SPEED = 60; // mph
    const FUEL_STOP_DISTANCE = 1000; // miles
    const DAILY_DRIVING_LIMIT = 11 * 60; // minutes
    const OFF_DUTY_BREAK_MINUTES = 30; // minutes
    const ON_DUTY_PICKUP_DROPOFF_MINUTES = 60; // minutes
    const ON_DUTY_FUEL_STOP_MINUTES = 30; // minutes
    const DAILY_ON_DUTY_LIMIT = 14 * 60; // minutes
    const CYCLE_LIMIT = 70; // hours over 8 days

    const totalTripTimeHours = DISTANCE / AVG_SPEED;
    const initialCycleUsedHours = parseFloat(formData.cycleUsed);

    // Check if the trip is possible within the cycle limit
    if (initialCycleUsedHours + totalTripTimeHours > CYCLE_LIMIT) {
        setMessage('Planned trip exceeds the 70-hour cycle limit. Please adjust your plan.');
        setMessageType('error');
        setIsLoading(false);
        return;
    }

    let remainingDrivingMinutes = totalTripTimeHours * 60;
    let distanceDriven = 0;
    const logSheets = [];
    let currentDayLog = [];
    let currentTimeMinutes = 0;
    let dailyDrivingMinutes = 0;
    let breakTakenToday = false;

    // Add pickup time
    currentDayLog.push({
      status: 'On Duty',
      event: 'Pickup',
      startTime: currentTimeMinutes,
      endTime: currentTimeMinutes + ON_DUTY_PICKUP_DROPOFF_MINUTES,
    });
    currentTimeMinutes += ON_DUTY_PICKUP_DROPOFF_MINUTES;

    while (remainingDrivingMinutes > 0) {
      // Check for daily limits and end the day if needed
      if (dailyDrivingMinutes >= DAILY_DRIVING_LIMIT || currentTimeMinutes >= DAILY_ON_DUTY_LIMIT) {
          currentDayLog.push({
              status: 'Sleeper',
              event: 'Sleeper Berth',
              startTime: currentTimeMinutes,
              endTime: 24 * 60,
          });
          logSheets.push(currentDayLog);
          currentDayLog = [];
          currentTimeMinutes = 0;
          dailyDrivingMinutes = 0;
          breakTakenToday = false;
          continue;
      }

      // Check for 30-min break
      if (dailyDrivingMinutes >= 8 * 60 && !breakTakenToday) {
          currentDayLog.push({
              status: 'Off Duty',
              event: 'Break',
              startTime: currentTimeMinutes,
              endTime: currentTimeMinutes + OFF_DUTY_BREAK_MINUTES,
          });
          currentTimeMinutes += OFF_DUTY_BREAK_MINUTES;
          breakTakenToday = true;
      }

      // Check for fuel stop
      if (distanceDriven >= FUEL_STOP_DISTANCE) {
          currentDayLog.push({
              status: 'On Duty',
              event: 'Fuel Stop',
              startTime: currentTimeMinutes,
              endTime: currentTimeMinutes + ON_DUTY_FUEL_STOP_MINUTES,
          });
          currentTimeMinutes += ON_DUTY_FUEL_STOP_MINUTES;
          distanceDriven = 0;
      }

      // Driving segment
      const driveMinutesForSegment = Math.min(
          remainingDrivingMinutes,
          DAILY_DRIVING_LIMIT - dailyDrivingMinutes,
          DAILY_ON_DUTY_LIMIT - currentTimeMinutes
      );

      if (driveMinutesForSegment > 0) {
          currentDayLog.push({
              status: 'Driving',
              event: 'En Route',
              startTime: currentTimeMinutes,
              endTime: currentTimeMinutes + driveMinutesForSegment,
          });

          currentTimeMinutes += driveMinutesForSegment;
          dailyDrivingMinutes += driveMinutesForSegment;
          remainingDrivingMinutes -= driveMinutesForSegment;
          distanceDriven += (driveMinutesForSegment / 60) * AVG_SPEED;
      } else if (remainingDrivingMinutes > 0) {
          // If no driving time can be added but the trip isn't over, end the day
          currentDayLog.push({
              status: 'Sleeper',
              event: 'Sleeper Berth',
              startTime: currentTimeMinutes,
              endTime: 24 * 60,
          });
          logSheets.push(currentDayLog);
          currentDayLog = [];
          currentTimeMinutes = 0;
          dailyDrivingMinutes = 0;
          breakTakenToday = false;
      }
    }

    // Add drop-off time on the last day
    currentDayLog.push({
      status: 'On Duty',
      event: 'Dropoff',
      startTime: currentTimeMinutes,
      endTime: currentTimeMinutes + ON_DUTY_PICKUP_DROPOFF_MINUTES,
    });
    logSheets.push(currentDayLog);

    const tripData = {
      driverName: formData.driverName,
      departureDate: formData.departureDate,
      departureTime: formData.departureTime,
      origin: formData.origin,
      destination: formData.destination,
      cycleUsed: formData.cycleUsed,
      distance: DISTANCE,
      totalDrivingTimeHours: totalTripTimeHours,
      totalDays: logSheets.length,
      logSheets: logSheets,
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
      setLogData(logSheets);
    } catch (e) {
      console.error("Error adding document: ", e);
      setMessage('Error saving trip plan. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    const tripInfo = mapData ? (
      <div className="bg-gray-50 p-6 rounded-2xl shadow-inner border border-gray-200 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Info className="h-6 w-6 mr-2 text-blue-600" /> Trip Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Driver:</span>
            <span className="text-gray-600">{mapData.driverName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Date:</span>
            <span className="text-gray-600">{mapData.departureDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Time:</span>
            <span className="text-gray-600">{mapData.departureTime}</span>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <span className="font-bold">Trip ID:</span> {mapData.id}
          <br/>
          <span className="font-bold">User ID:</span> {userId}
        </div>
      </div>
    ) : null;

    switch (activeTab) {
      case 'home':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Plan a New Trip</h2>
            <p className="text-gray-500 mb-6">Fill out the details below to generate a route and ELD log for your trip.</p>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      name="departureTime"
                      value={formData.departureTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                <div className="relative">
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 transition duration-200"
                  >
                    <Locate className="h-5 w-5" />
                  </button>
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
            {tripInfo}
            <div ref={mapContainer} className="h-[600px] w-full rounded-xl shadow-lg border border-gray-200"></div>
          </div>
        );
      case 'logs':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ELD Logs</h2>
            <p className="text-gray-500 mb-4">This log sheet is a simulated representation of your driving hours based on standard regulations.</p>
            {tripInfo}
            {logData.map((dayLog, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 mb-6">
                <h4 className="font-bold text-gray-800 mb-4">Day {index + 1}</h4>
                <canvas ref={el => logCanvasRefs.current[index] = el} width="800" height="200" className="w-full"></canvas>
                <div className="mt-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Events:</h5>
                  <ul className="space-y-1 text-sm">
                    {dayLog.map((event, eventIndex) => (
                      <li key={eventIndex} className="flex items-center space-x-2">
                        {event.status === 'Driving' && <Truck className="h-4 w-4 text-red-500" />}
                        {event.status === 'On Duty' && <Gauge className="h-4 w-4 text-orange-500" />}
                        {event.status === 'Sleeper' && <Bed className="h-4 w-4 text-blue-500" />}
                        {event.status === 'Off Duty' && <XCircle className="h-4 w-4 text-green-500" />}
                        <span className="font-medium">{event.status} - {event.event}:</span>
                        <span className="text-gray-500">{Math.floor(event.startTime / 60).toString().padStart(2, '0')}:{Math.floor(event.startTime % 60).toString().padStart(2, '0')} - {Math.floor(event.endTime / 60).toString().padStart(2, '0')}:{Math.floor(event.endTime % 60).toString().padStart(2, '0')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );
      case 'reports':
        const totalDrivingTime = mapData?.totalDrivingTimeHours || 0;
        const totalDistance = mapData?.distance || 0;
        const numDays = mapData?.totalDays || 0;
        const totalOnDutyTime = mapData?.logSheets?.flat().reduce((total, event) => total + (event.status === 'On Duty' ? (event.endTime - event.startTime) / 60 : 0), 0) || 0;
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" /> Trip Report
            </h2>
            {tripInfo}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                        <Database className="h-8 w-8 text-blue-500 mb-2" />
                        <span className="text-sm font-medium text-gray-500">Total Distance</span>
                        <span className="text-2xl font-bold text-blue-600 mt-1">{totalDistance} mi</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                        <Clock className="h-8 w-8 text-orange-500 mb-2" />
                        <span className="text-sm font-medium text-gray-500">Total Driving Time</span>
                        <span className="text-2xl font-bold text-orange-600 mt-1">{totalDrivingTime.toFixed(1)} hrs</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                        <Calendar className="h-8 w-8 text-green-500 mb-2" />
                        <span className="text-sm font-medium text-gray-500">Total Days</span>
                        <span className="text-2xl font-bold text-green-600 mt-1">{numDays}</span>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Breakdown</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center space-x-3">
                            <Truck className="h-5 w-5 text-red-500" />
                            <span className="font-medium">Driving Time:</span>
                            <span className="text-gray-600">{totalDrivingTime.toFixed(1)} hours</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <Gauge className="h-5 w-5 text-orange-500" />
                            <span className="font-medium">On Duty Time:</span>
                            <span className="text-gray-600">{totalOnDutyTime.toFixed(1)} hours (Pickup, Drop-off, Fuel)</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <Bed className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">Sleeper Berth/Off Duty:</span>
                            <span className="text-gray-600">Calculated based on 24-hour cycle</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <Fuel className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">Fuel Stops:</span>
                            <span className="text-gray-600">{Math.floor(mapData.distance / 1000)} planned stop(s)</span>
                        </li>
                    </ul>
                </div>
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
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-full transition-colors duration-200 font-medium ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <TrendingUp className="h-5 w-5 inline-block mr-2" /> Reports
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
