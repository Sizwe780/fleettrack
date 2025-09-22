import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, where, serverTimestamp, setLogLevel } from 'firebase/firestore';
import { Truck, MapPin, Gauge, User, Clock, Calendar, TrendingUp, Info, Fuel, Bed, FileText, Plus, ListChecks, Database, Locate, Settings } from 'lucide-react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Define global variables provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Use a CDN for Mapbox GL JS. We cannot use `npm install` in this environment.
// This is added in the HTML template.
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Function to convert hours to hh:mm format
const formatHours = (totalHours) => {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const TripMap = ({ origin, destination, trip, onStopsGenerated }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

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

  useEffect(() => {
    if (!origin?.lat || !destination?.lat || !window.mapboxgl) return;
    if (map.current) return; // Initialize map only once

    // Use a unique ID for the container to avoid conflicts
    mapContainer.current.id = `map-container-${uuidv4()}`;

    window.mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [origin.lng, origin.lat],
      zoom: 6,
    });

    map.current.on('load', async () => {
      new window.mapboxgl.Marker({ color: 'green' })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new window.mapboxgl.Popup().setText('Origin'))
        .addTo(map.current);
      new window.mapboxgl.Marker({ color: 'blue' })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new window.mapboxgl.Popup().setText('Destination'))
        .addTo(map.current);

      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
        const response = await axios.get(url);
        const data = response.data.routes[0];
        const route = data.geometry;
        const totalDistance = data.distance; // in meters
        const totalDuration = data.duration; // in seconds

        const tripMiles = totalDistance * 0.000621371;
        const tripHours = totalDuration / 3600;
        const fuelStopsNeeded = Math.max(0, Math.floor(tripMiles / 1000));
        const restStopsNeeded = Math.floor(tripHours / 8);

        const stopRemarks = [];
        const coordinates = route.coordinates;

        // Add rest stops
        if (restStopsNeeded > 0) {
          for (let i = 1; i <= restStopsNeeded; i++) {
            const index = Math.floor((coordinates.length / (restStopsNeeded + 1)) * i);
            const [lng, lat] = coordinates[index] || [];
            if (!isNaN(lat) && !isNaN(lng)) {
              const locationName = await getLocationName(lng, lat);
              new window.mapboxgl.Marker({ color: 'red' })
                .setLngLat([lng, lat])
                .setPopup(new window.mapboxgl.Popup().setText(`Rest Stop ${i}: ${locationName}`))
                .addTo(map.current);
              stopRemarks.push(`Rest Stop ${i}: ${locationName}`);
            }
          }
        }

        // Add fuel stops
        if (fuelStopsNeeded > 0) {
          for (let i = 1; i <= fuelStopsNeeded; i++) {
            const index = Math.floor((coordinates.length / (fuelStopsNeeded + 1)) * i);
            const [lng, lat] = coordinates[index] || [];
            if (!isNaN(lat) && !isNaN(lng)) {
              const locationName = await getLocationName(lng, lat);
              new window.mapboxgl.Marker({ color: 'purple' })
                .setLngLat([lng, lat])
                .setPopup(new window.mapboxgl.Popup().setText(`Fuel Stop ${i}: ${locationName}`))
                .addTo(map.current);
              stopRemarks.push(`Fuel Stop ${i}: ${locationName}`);
            }
          }
        }
        
        if (map.current.getSource('route')) {
            map.current.getSource('route').setData({
              type: 'Feature',
              properties: {},
              geometry: route,
            });
          } else {
            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: route,
                },
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 8,
              },
            });
          }

        if (typeof onStopsGenerated === 'function') {
          onStopsGenerated(stopRemarks);
        }

      } catch (error) {
        console.error('Failed to fetch route:', error);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [origin, destination, onStopsGenerated]);

  return (
    <>
      <div id="map-container" ref={mapContainer} className="h-96 w-full rounded-lg shadow-inner z-0"></div>
    </>
  );
};

const LogSheet = ({ tripData, stopRemarks, userId }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!tripData || !canvasRef.current || !userId) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    const drawGrid = () => {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const ampm = ['am', 'pm'];
      const topOffset = 200;
      const leftOffset = 200;
      const timeLineHeight = height - topOffset - 50;

      for (let i = 0; i < 24; i++) {
        const x = leftOffset + (i / 24) * (width - leftOffset - 50);
        ctx.beginPath();
        ctx.moveTo(x, topOffset);
        ctx.lineTo(x, topOffset + timeLineHeight);
        ctx.stroke();

        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        const hour = hours[i % 12];
        const meridiem = ampm[Math.floor(i / 12)];
        ctx.fillText(`${hour}${meridiem}`, x, topOffset - 10);
      }
    };

    const drawLogs = () => {
      // Clear the canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw header
      ctx.fillStyle = '#1f2937';
      ctx.font = '24px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Daily Log Sheet', canvas.width / 2, 50);

      // Draw driver info
      ctx.font = '16px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(`Driver ID: ${userId}`, 50, 90);
      ctx.fillText(`Trip Start: ${tripData.origin.name}`, 50, 120);
      ctx.fillText(`Trip End: ${tripData.destination.name}`, 50, 150);

      // Draw a line for the log grid
      ctx.beginPath();
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.moveTo(50, 180);
      ctx.lineTo(canvas.width - 50, 180);
      ctx.stroke();

      // Draw log remarks
      ctx.font = '14px Inter';
      ctx.fillStyle = '#4b5563';
      let yOffset = 220;
      stopRemarks.forEach((remark, index) => {
        ctx.fillText(`- ${remark}`, 50, yOffset);
        yOffset += 20;
      });
    };

    drawLogs();
  }, [tripData, stopRemarks, userId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">ELD Log Sheet</h2>
      <canvas ref={canvasRef} className="w-full h-auto border border-gray-300 rounded-lg"></canvas>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cycleUsed, setCycleUsed] = useState(0);
  const [tripData, setTripData] = useState(null);
  const [stopRemarks, setStopRemarks] = useState([]);
  const [savedTrips, setSavedTrips] = useState([]);

  useEffect(() => {
    if (!auth) {
      setIsAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          // Use anonymous sign-in as a fallback
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Firebase Auth failed:", error);
        }
      }
      setIsAuthReady(true);
    });
    setLogLevel('debug');
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !db) return;

    const userIdToFetch = userId || 'anonymous';
    const tripsCollection = collection(db, 'artifacts', appId, 'users', userIdToFetch, 'trips');
    const q = query(tripsCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedTrips(trips);
    }, (error) => {
      console.error("Failed to fetch trips:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, userId, db]);

  const handleStopsGenerated = (remarks) => {
    setStopRemarks(remarks);
  };

  const handleSaveTrip = async () => {
    if (!db || !userId) {
      console.error("Firebase not initialized or user not authenticated.");
      return;
    }
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'trips'), {
        origin: tripData.origin,
        destination: tripData.destination,
        cycleUsed: tripData.cycleUsed,
        distance: tripData.distance,
        duration: tripData.duration,
        stopRemarks: stopRemarks,
        createdAt: serverTimestamp(),
      });
      alert('Trip saved successfully!');
    } catch (error) {
      console.error("Error saving trip:", error);
      alert('Error saving trip.');
    }
  };

  const handleGenerateTrip = async (e) => {
    e.preventDefault();
    if (!origin || !destination) return;

    try {
      const originRes = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${origin}.json`, {
        params: { access_token: MAPBOX_ACCESS_TOKEN },
      });
      const destRes = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${destination}.json`, {
        params: { access_token: MAPBOX_ACCESS_TOKEN },
      });

      const originPlace = originRes.data.features[0];
      const destPlace = destRes.data.features[0];

      if (!originPlace || !destPlace) {
        alert("Could not find locations. Please be more specific.");
        return;
      }

      setTripData({
        origin: { name: originPlace.place_name, lat: originPlace.center[1], lng: originPlace.center[0] },
        destination: { name: destPlace.place_name, lat: destPlace.center[1], lng: destPlace.center[0] },
        cycleUsed: parseFloat(cycleUsed),
        // Placeholder values for now, will be updated by TripMap component
        distance: 0,
        duration: 0,
        stops: [],
      });

    } catch (error) {
      console.error("Error generating trip:", error);
      alert("An error occurred while generating the trip.");
    }
  };

  if (!isAuthReady) {
    return <div className="flex justify-center items-center h-screen bg-gray-100">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Add Mapbox CDN links to the document head */}
      <link href="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.css" rel="stylesheet" />
      <script src="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                sans: ['Inter', 'sans-serif'],
              },
            },
          },
        }
      </script>
      <div className="container mx-auto font-sans">
        <header className="flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold text-blue-800">
            <Truck className="inline-block mr-2 text-blue-600" size={32} />
            LogTrack
          </h1>
          <p className="text-sm text-gray-500">Full-Stack Assessment Solution</p>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <section className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
              <ListChecks size={24} />
              Trip Details
            </h2>
            <div className="flex flex-col items-center text-sm font-medium p-4 rounded-lg bg-blue-50 text-blue-800">
              <User className="inline-block mr-2" />
              Driver ID: <span className="font-mono text-xs">{userId}</span>
            </div>
            <form onSubmit={handleGenerateTrip} className="flex flex-col gap-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="origin" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <MapPin size={16} /> Current Location
                  </label>
                  <input
                    type="text"
                    id="origin"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Los Angeles, CA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="destination" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <MapPin size={16} /> Pickup & Dropoff Location
                  </label>
                  <input
                    type="text"
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. New York, NY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="cycleUsed" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Clock size={16} /> Current Cycle Used (Hours)
                  </label>
                  <input
                    type="number"
                    id="cycleUsed"
                    value={cycleUsed}
                    onChange={(e) => setCycleUsed(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    min="0"
                    max="70"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                <TrendingUp size={20} /> Generate Trip
              </button>
            </form>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2 mb-4">
              <MapPin size={24} />
              Route Map
            </h2>
            {tripData ? (
              <TripMap
                origin={{ lat: tripData.origin.lat, lng: tripData.origin.lng }}
                destination={{ lat: tripData.destination.lat, lng: tripData.destination.lng }}
                trip={tripData}
                onStopsGenerated={handleStopsGenerated}
              />
            ) : (
              <div className="h-96 w-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 italic">
                Enter trip details and click "Generate Trip" to see the route.
              </div>
            )}
            {tripData && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSaveTrip}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
                >
                  <Plus size={16} className="inline-block mr-2" /> Save Trip
                </button>
              </div>
            )}
          </section>
        </main>
        {tripData && (
          <section className="mt-8">
            <LogSheet tripData={tripData} stopRemarks={stopRemarks} userId={userId} />
          </section>
        )}
        <section className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2 mb-4">
            <Database size={24} />
            Saved Trips
          </h2>
          {savedTrips.length === 0 ? (
            <p className="text-gray-500 italic">No trips saved yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stops
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {savedTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trip.origin.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.destination.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trip.stopRemarks && trip.stopRemarks.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {trip.stopRemarks.map((remark, index) => (
                              <li key={index}>{remark}</li>
                            ))}
                          </ul>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;
