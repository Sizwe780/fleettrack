import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Star, User, Clock, Calendar, Gauge, CheckCircle, XCircle, Locate, Loader, Printer, StickyNote, Fuel, Bed, Database, ListChecks, TrendingUp, Info, Car, FileText, Settings, BarChart2, Book, Plus, Home, RefreshCw, Send, Lock, Globe, Share2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, where, getDocs, setLogLevel, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// Define global variables provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Mapbox token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

// Initialize Firebase
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Set log level for Firebase
if (db) {
  setLogLevel('debug');
}

const getUserId = (auth) => {
  if (auth && auth.currentUser) {
    return auth.currentUser.uid;
  }
  return crypto.randomUUID();
};

// Canvas Drawing function
const drawLogSheet = (canvasRef, trip) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Background and border
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Driver\'s Daily Log', width / 2, 25);

  const totalHours = trip.totalHours || 0;
  const milesDriven = trip.distance || 0;

  // Log chart dimensions
  const chartHeight = height - 100;
  const chartWidth = width - 50;
  const xOffset = 25;
  const yOffset = 70;

  // Draw grid lines
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 24; i++) {
    const x = xOffset + (i / 24) * chartWidth;
    ctx.beginPath();
    ctx.moveTo(x, yOffset);
    ctx.lineTo(x, yOffset + chartHeight);
    ctx.stroke();
    // Hour labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(i, x, yOffset - 10);
  }

  // Draw HOS segments
  const h = chartHeight / 4;
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1f2937';
  const labels = ['Off Duty', 'Sleeper', 'Driving', 'On Duty'];
  labels.forEach((label, i) => {
    ctx.fillText(label, 5, yOffset + h * i + h / 2);
    ctx.beginPath();
    ctx.moveTo(xOffset, yOffset + h * (i + 1));
    ctx.lineTo(xOffset + chartWidth, yOffset + h * (i + 1));
    ctx.stroke();
  });

  // Example: Draw a driving segment
  ctx.fillStyle = '#3b82f6';
  const drivingStartHour = 0; // Placeholder
  const drivingDurationHours = totalHours;
  const drivingXStart = xOffset + (drivingStartHour / 24) * chartWidth;
  const drivingXEnd = drivingXStart + (drivingDurationHours / 24) * chartWidth;
  ctx.fillRect(drivingXStart, yOffset + h * 2, drivingXEnd - drivingXStart, h);

  // Draw total stats
  ctx.fillStyle = '#1f2937';
  ctx.font = '14px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Total Hours: ${totalHours.toFixed(2)} hrs`, xOffset, height - 40);
  ctx.fillText(`Miles Driven: ${milesDriven.toFixed(2)} mi`, xOffset, height - 20);
};

// Main App Component
const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [publicTrips, setPublicTrips] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [tripForm, setTripForm] = useState({
    origin: '',
    destination: '',
    currentLocation: '',
    currentCycleUsed: '',
    isPublic: false
  });
  const canvasRef = useRef(null);

  // State for search grounding
  const [searchResponse, setSearchResponse] = useState('');
  const [searchSources, setSearchSources] = useState([]);

  // UseEffect for Firebase Auth
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (initialAuthToken) {
          try {
            await signInWithCustomToken(auth, initialAuthToken);
          } catch (e) {
            console.error("Error signing in with custom token:", e);
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      }
      setUserId(getUserId(auth));
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // UseEffect for Firestore Data Listeners
  useEffect(() => {
    if (!isAuthReady || !db) return;

    // Private trips listener
    const privateTripsPath = `artifacts/${appId}/users/${userId}/trips`;
    const qPrivate = collection(db, privateTripsPath);
    const unsubscribePrivate = onSnapshot(qPrivate, (snapshot) => {
      const newTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(newTrips);
    }, (e) => {
      console.error("Error listening to private trips:", e);
      setError("Failed to load private trips.");
    });

    // Public trips listener
    const publicTripsPath = `artifacts/${appId}/public/data/trips`;
    const qPublic = collection(db, publicTripsPath);
    const unsubscribePublic = onSnapshot(qPublic, (snapshot) => {
      const newPublicTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPublicTrips(newPublicTrips);
    }, (e) => {
      console.error("Error listening to public trips:", e);
      setError("Failed to load public trips.");
    });

    return () => {
      unsubscribePrivate();
      unsubscribePublic();
    };
  }, [isAuthReady, userId, db]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTripForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!db || !userId) return;

    setIsFetching(true);
    setError(null);

    const tripData = {
      ...tripForm,
      userId,
      createdAt: serverTimestamp(),
      distance: 0,
      duration: 0,
      totalHours: 0,
      stopRemarks: [],
    };

    try {
      if (tripForm.isPublic) {
        await addDoc(collection(db, `artifacts/${appId}/public/data/trips`), tripData);
      } else {
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/trips`), tripData);
      }
      setTripForm({
        origin: '',
        destination: '',
        currentLocation: '',
        currentCycleUsed: '',
        isPublic: false
      });
      // Trigger a map fetch with the new trip data
      getTripDetails(tripData);
    } catch (e) {
      console.error("Error creating trip:", e);
      setError("Failed to save trip. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  const getTripDetails = async (trip) => {
    // This is a placeholder for a more complex routing and log calculation API
    // The front-end will simulate this for now
    setIsFetching(true);
    try {
      const distance = 1200 + Math.random() * 500; // Simulated
      const duration = (distance / 60) * 1.5; // Simulated, assuming avg 60 mph + rests
      const totalHours = parseFloat(trip.currentCycleUsed) + duration;
      const fuelStopsNeeded = Math.floor(distance / 1000) + 1;
      const stopRemarks = [`Fuel stop needed every 1000 miles. Total stops: ${fuelStopsNeeded}`];

      // Update the trip with simulated data
      const updatedTrip = {
        ...trip,
        distance: distance,
        duration: duration,
        totalHours: totalHours,
        stopRemarks: stopRemarks,
      };
      
      // Update the database document
      const docRef = trip.isPublic
        ? doc(db, `artifacts/${appId}/public/data/trips`, trip.id)
        : doc(db, `artifacts/${appId}/users/${userId}/trips`, trip.id);
      
      await updateDoc(docRef, updatedTrip);

      // Now draw the log sheet for this trip
      setTimeout(() => drawLogSheet(canvasRef, updatedTrip), 100);

    } catch (e) {
      console.error("Error calculating trip details:", e);
      setError("Failed to calculate trip details.");
    } finally {
      setIsFetching(false);
    }
  };

  // Google Search grounding
  const fetchMapDetails = async (location) => {
    if (!location) return;
    setIsFetching(true);
    setSearchResponse('');
    setSearchSources([]);
    
    const systemPrompt = "Act as a world-class travel analyst. Provide a concise, single-paragraph summary of the key findings.";
    const userQuery = `Find the key attractions, rest stops and fueling stations for a trip to ${location}.`;
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            setSearchResponse(candidate.content.parts[0].text);
            const groundingMetadata = candidate.groundingMetadata;
            if (groundingMetadata && groundingMetadata.groundingAttributions) {
                const sources = groundingMetadata.groundingAttributions
                    .map(attribution => ({
                        uri: attribution.web?.uri,
                        title: attribution.web?.title,
                    }))
                    .filter(source => source.uri && source.title);
                setSearchSources(sources);
            }
        } else {
            setError("No details found for this location.");
        }
    } catch (e) {
        console.error("Error fetching map details:", e);
        setError("Failed to fetch location details.");
    } finally {
        setIsFetching(false);
    }
  };

  // Image Generation
  const generateImage = async (prompt) => {
    setIsGeneratingImage(true);
    setImageUrl('');
    const payload = { instances: { prompt: prompt }, parameters: { "sampleCount": 1} };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            const imageData = result.predictions[0].bytesBase64Encoded;
            setImageUrl(`data:image/png;base64,${imageData}`);
        } else {
            setError("Failed to generate image.");
        }
    } catch (e) {
        console.error("Error generating image:", e);
        setError("Failed to generate image.");
    } finally {
        setIsGeneratingImage(false);
    }
  };

  // UI components
  const NavButton = ({ view, icon, label }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
        activeView === view
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const Dashboard = () => (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
        <Home className="w-8 h-8" />
        <span>Welcome to Logtrack</span>
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Your all-in-one solution for trip management and ELD compliance. This is your command center.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">Trip Analytics</h2>
          </div>
          <p className="text-gray-600">
            View key metrics for your trips, including total distance, duration, and hours of service.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <Database className="w-8 h-8 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800">Real-time Sync</h2>
          </div>
          <p className="text-gray-600">
            All your trips are stored securely in the cloud and synced in real-time across all your devices.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <User className="w-8 h-8 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-800">Collaborate</h2>
          </div>
          <p className="text-gray-600">
            Share your public trips with others and collaborate on routes and logs in real-time.
          </p>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-xl shadow-inner border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Generate AI-Powered Visuals</h3>
        <p className="text-gray-600 mb-4">
          Click the button below to generate a unique image of a truck on the road.
        </p>
        <button
          onClick={() => generateImage('a vibrant, modern, high-definition digital art illustration of a semi-truck driving on a winding road at sunset, with a sense of adventure, epic feel, stylized, hyper-realistic details')}
          className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          disabled={isGeneratingImage}
        >
          {isGeneratingImage ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate Truck Image</span>
          )}
        </button>
        {isGeneratingImage && (
          <div className="mt-4 flex items-center space-x-2 text-gray-500">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Generating your image... this may take a moment.</span>
          </div>
        )}
        {imageUrl && (
          <div className="mt-6 flex flex-col items-center">
            <img src={imageUrl} alt="Generated Art" className="rounded-xl shadow-xl max-w-full h-auto" />
            <p className="mt-2 text-sm text-gray-500">Your unique image is ready!</p>
          </div>
        )}
      </div>
    </div>
  );

  const TripPlanner = () => (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
        <MapPin className="w-8 h-8" />
        <span>Trip Planner</span>
      </h1>
      <form onSubmit={handleCreateTrip} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Current Location</label>
            <input
              type="text"
              name="currentLocation"
              value={tripForm.currentLocation}
              onChange={handleInputChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Chicago, IL"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
            <input
              type="text"
              name="origin"
              value={tripForm.origin}
              onChange={handleInputChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Dallas, TX"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Dropoff Location</label>
            <input
              type="text"
              name="destination"
              value={tripForm.destination}
              onChange={handleInputChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Seattle, WA"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Current Cycle Used (Hrs)</label>
            <input
              type="number"
              name="currentCycleUsed"
              value={tripForm.currentCycleUsed}
              onChange={handleInputChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., 20"
            />
          </div>
        </div>
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            name="isPublic"
            checked={tripForm.isPublic}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <label className="ml-2 text-sm font-medium text-gray-700">Make this trip public for collaboration</label>
        </div>
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Planning Trip...</span>
              </>
            ) : (
              <>
                <Car className="w-5 h-5" />
                <span>Plan Trip</span>
              </>
            )}
          </button>
        </div>
      </form>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="p-4 bg-gray-100 rounded-xl shadow-inner border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Trip Details & Logs</h2>
        <canvas ref={canvasRef} width="600" height="400" className="w-full h-auto bg-white rounded-xl shadow-md border border-gray-300"></canvas>
      </div>
    </div>
  );

  const MyTrips = () => (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
        <ListChecks className="w-8 h-8" />
        <span>My Private Trips</span>
      </h1>
      <p className="text-sm text-gray-500 mb-4">User ID: <span className="font-mono text-gray-700 break-all">{userId}</span></p>
      <div className="space-y-4">
        {trips.length > 0 ? trips.map(trip => (
          <div key={trip.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Truck />
              <span>{trip.origin} to {trip.destination}</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Created: {trip.createdAt?.toDate().toLocaleDateString()}</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
              <div className="flex items-center space-x-2"><Gauge className="w-4 h-4 text-blue-500" /><span>Miles: {trip.distance?.toFixed(2) || 'N/A'}</span></div>
              <div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-blue-500" /><span>Duration: {trip.duration?.toFixed(2) || 'N/A'} hrs</span></div>
              <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-blue-500" /><span>HOS Used: {trip.totalHours?.toFixed(2) || 'N/A'} hrs</span></div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => getTripDetails(trip)}
                className="bg-blue-500 text-white text-sm py-2 px-4 rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-1"
                disabled={isFetching}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recalculate</span>
              </button>
            </div>
          </div>
        )) : <div className="text-gray-500 text-center py-8">No private trips saved yet.</div>}
      </div>
    </div>
  );

  const PublicTrips = () => (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
        <Globe className="w-8 h-8" />
        <span>Public Trips</span>
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Collaborate with other drivers. Here is the list of public trips shared by other users.
      </p>
      <div className="space-y-4">
        {publicTrips.length > 0 ? publicTrips.map(trip => (
          <div key={trip.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Share2 />
              <span>{trip.origin} to {trip.destination}</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">User: <span className="font-mono text-gray-700 break-all">{trip.userId}</span></p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
              <div className="flex items-center space-x-2"><Gauge className="w-4 h-4 text-blue-500" /><span>Miles: {trip.distance?.toFixed(2) || 'N/A'}</span></div>
              <div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-blue-500" /><span>Duration: {trip.duration?.toFixed(2) || 'N/A'} hrs</span></div>
              <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-blue-500" /><span>HOS Used: {trip.totalHours?.toFixed(2) || 'N/A'} hrs</span></div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700">Stop Remarks:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {trip.stopRemarks && trip.stopRemarks.map((remark, index) => <li key={index}>{remark}</li>)}
              </ul>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => getTripDetails(trip)}
                className="bg-blue-500 text-white text-sm py-2 px-4 rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-1"
                disabled={isFetching}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recalculate</span>
              </button>
              <button
                onClick={() => fetchMapDetails(trip.destination)}
                className="bg-purple-500 text-white text-sm py-2 px-4 rounded-full hover:bg-purple-600 transition-colors flex items-center space-x-1"
                disabled={isFetching}
              >
                <Info className="w-4 h-4" />
                <span>Get Details</span>
              </button>
            </div>
            {searchResponse && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-800">{searchResponse}</p>
                {searchSources.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Sources:</p>
                    <ul className="list-disc list-inside">
                      {searchSources.map((source, index) => (
                        <li key={index}>
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{source.title}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )) : <div className="text-gray-500 text-center py-8">No public trips available.</div>}
      </div>
    </div>
  );

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'planner':
        return <TripPlanner />;
      case 'my-trips':
        return <MyTrips />;
      case 'public-trips':
        return <PublicTrips />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="bg-white p-4 md:p-6 shadow-lg md:min-h-screen md:w-64 border-r border-gray-200 flex flex-col items-center md:items-start">
          <div className="flex items-center space-x-3 mb-8">
            <Truck className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">Logtrack</span>
          </div>
          <nav className="flex flex-col space-y-2 w-full">
            <NavButton view="dashboard" icon={<Home className="w-5 h-5" />} label="Dashboard" />
            <NavButton view="planner" icon={<Car className="w-5 h-5" />} label="Trip Planner" />
            <NavButton view="my-trips" icon={<ListChecks className="w-5 h-5" />} label="My Trips" />
            <NavButton view="public-trips" icon={<Globe className="w-5 h-5" />} label="Public Trips" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
