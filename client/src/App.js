// ✅  Core & React
import { query, where, orderBy} from 'firebase/firestore';
import React, { useState, useEffect, useRef, useCallback } from 'react';
// ✅  Mapbox (react-map-gl@8.x requires subpath imports)
import { Map, Source, Layer, Marker } from 'react-map-gl/mapbox'; // or 'react-map-gl/maplibre' if using MapLibre
import 'mapbox-gl/dist/mapbox-gl.css';
// ✅  Lucide Icons
import {
  Truck, MapPin, DollarSign, UploadCloud, ShieldCheck, FileText, Plus,
  Home, ListChecks, Loader, Car, Star, Fuel, TrendingUp, BarChart2, Wrench, Trash2
} from 'lucide-react';
// ✅  Firebase Modular SDK
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  addDoc,
  onSnapshot,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
// ✅  Internal Components & Pages
import PlaceholderCard from './components/PlaceholderCard';
import TripPlanner from './components/TripPlanner';
import Dashboard from './pages/Dashboard';
import FleetAnalytics from './pages/FleetAnalytics';
import TripCompare from './pages/TripCompare';
import FleetHealth from './pages/FleetHealth';
import TripReplay from './components/TripReplay';
// ✅  CONFIGURATION
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAla1ZaxyeLc9WBDvKbAS8I9hUZnxIWxPg",
  authDomain: "fleettrack-84eb6.firebaseapp.com",
  projectId: "fleettrack-84eb6",
  storageBucket: "fleettrack-84eb6.appspot.com",
  messagingSenderId: "918797565578",
  appId: "1:918797565578:web:34dfa9992cd5a4a3cbf773",
  measurementId: "G-MKSLF88L7C"
};
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';
// ✅  FIREBASE INITIALIZATION (guarded against duplicate-app error)
const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'fleet-track-app';
// ✅  MAIN APP COMPONENT
const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [userId, setUserId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicle, setVehicle] = useState({
    id: 'TRUCK-001',
    odometer: 125000,
    maintenanceLogs: [
      { event: 'Oil Change', mileage: 120000, date: '2025-08-15' },
      { event: 'Tire Rotation', mileage: 115000, date: '2025-07-22' },
    ],
    maintenanceSchedule: {
      'Oil Change': 15000,
      'Tire Rotation': 10000,
      'Engine Check': 50000,
    }
  });
  useEffect(() => {
    onAuthStateChanged(auth, user =>
      user ? setUserId(user.uid) : signInAnonymously(auth)
    );
  }, []);
  useEffect(() => {
    if (!userId) return;
    const tripsQuery = query(
      collection(db, 'apps/fleet-track-app/trips'),
      where('driver_uid', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(
      tripsQuery,
      snapshot => {
        setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setIsLoading(false);
      },
      error => {
        console.error('Snapshot error:', error.message);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [userId]);
  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setActiveView('details');
  };
  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Loader className="animate-spin w-12 h-12 text-blue-600" />
        </div>
      );
    }

    if (!userId) {
      return (
        <div className="p-6 text-center text-gray-600">
          <p>Authenticating user... Please wait.</p>
        </div>
      );
    }

    switch (activeView) {
      case 'planner':
        return (
          // 💡 Pass the appId variable to the component here
          <TripPlanner
            userId={userId}
            onTripCreated={handleTripSelect}
            appId={appId}
          />
        );

      case 'my-trips':
        return (
          <MyTripsDashboard
            trips={trips}
            onTripSelect={handleTripSelect}
          />
        );
      case 'fleet-health':
        return <FleetHealth />;

      case 'maintenance':
        return (
          <MaintenanceTracker
            vehicle={vehicle}
            setVehicle={setVehicle}
          />
        );
      case 'analytics':
        return <FleetAnalytics />;
      case 'compare':
        return <TripCompare />;
      case 'details':
        return selectedTrip ? (
          <Dashboard trip={selectedTrip} />
        ) : (
          <div className="p-6 text-gray-500">
            No trip selected. Choose one from **My Trips**.
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Welcome to FleetTrack</h2>
            <p className="text-gray-600">Select a view from the sidebar to get started.</p>
          </div>
        );
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex flex-col md:flex-row max-w-screen-xl mx-auto">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 md:p-8 bg-gray-100 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};
// ✅  SIDEBAR COMPONENT
const Sidebar = ({ activeView, setActiveView }) => (
  <aside className="bg-white px-4 py-6 shadow-lg md:min-h-screen md:w-64 border-r border-gray-200 -ml-4">
    <div className="flex items-center space-x-3 mb-10">
      <div className="bg-blue-600 p-2 rounded-lg">
        <Truck className="w-8 h-8 text-white" />
      </div>
      <span className="text-2xl font-bold text-gray-800">FleetTrack</span>
    </div>
    <nav className="flex flex-col space-y-3">
      <NavButton view="dashboard" label="Dashboard" icon={<Home />} activeView={activeView} onClick={setActiveView} />
      <NavButton view="planner" label="New Trip" icon={<Plus />} activeView={activeView} onClick={setActiveView} />
      <NavButton view="my-trips" label="My Trips" icon={<ListChecks />} activeView={activeView} onClick={setActiveView} />
      <NavButton view="maintenance" label="Maintenance" icon={<Wrench />} activeView={activeView} onClick={setActiveView} />
      <NavButton view="analytics" label="Fleet Analytics" icon={<BarChart2 />} activeView={activeView} onClick={setActiveView} />
      <NavButton view="compare" label="Compare Trips" icon={<TrendingUp />} activeView={activeView} onClick={setActiveView} />
      <NavButton view="fleet-health" label="Fleet Health" icon={<ShieldCheck />} activeView={activeView} onClick={setActiveView} />
    </nav>
  </aside>
);
// ✅  NAV BUTTON COMPONENT
const NavButton = ({ view, label, icon, activeView, onClick }) => (
  <button
    onClick={() => onClick(view)}
    className={`flex items-center space-x-2 px-4 py-2 rounded-md ${activeView === view ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
// --- PRIMARY VIEWS ---
const MyTripsDashboard = ({ trips, onTripSelect }) => {
  const [showReplay, setShowReplay] = useState(null);
  const avgHealthScore = Math.round(
    trips.reduce((sum, t) => sum + (t.healthScore ?? 0), 0) / (trips.length || 1)
  );
  const avgProfit = Math.round(
    trips.reduce((sum, t) => sum + (t.analysis?.profitability?.netProfit ?? 0), 0) / (trips.length || 1)
  );
  const flaggedTrips = trips.filter(t => t.status === 'critical');
  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-8">
      <h2 className="text-2xl font-bold"> 🚚  Fleet Intelligence Console</h2>
      {/* Fleet Health Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
        <div className="bg-green-50 p-3 rounded">
          <p className="font-semibold">Avg Fleet Score</p>
          <p>{avgHealthScore}/100</p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="font-semibold">Trips This Month</p>
          <p>{trips.length}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <p className="font-semibold">Flagged Trips</p>
          <p>{flaggedTrips.length}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <p className="font-semibold">Avg Profit</p>
          <p>R{avgProfit}</p>
        </div>
      </div>
      {/* Optional Modules */}
      {/* <FleetHeatmap trips={trips} /> */}
      {/* <DriverLeaderboard trips={trips} /> */}
      {/* Compliance Export */}
      <button
        onClick={() => console.log('Exporting audit logs...')}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
      >
        🧾  Export Compliance Logs
      </button>
      {/* Trip Cards */}
      {trips.length === 0 ? (
        <p className="text-sm text-gray-500 mt-4">No trips found. Submit one to get started.</p>
      ) : (
        trips.map(trip => (
          <div key={trip.id} className={`p-4 rounded-xl shadow-md border ${trip.status === 'critical' ? 'border-red-500 bg-red-50' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{trip.origin} → {trip.destination}</h3>
              <span className="text-xs text-gray-500">{new Date(trip.date).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold">Health Score</p>
                <p>{trip.healthScore}/100</p>
              </div>
              <div>
                <p className="font-semibold">Status</p>
                <p>{trip.status}</p>
              </div>
              <div>
                <p className="font-semibold">Profit</p>
                <p>R{trip.analysis?.profitability?.netProfit ?? '—'}</p>
              </div>
              <div>
                <p className="font-semibold">Fuel Used</p>
                <p>{trip.analysis?.ifta?.fuelUsed ?? '—'} L</p>
              </div>
            </div>
            {trip.flagReason && (
              <div className="mt-3 text-sm text-red-600">
                🚨  **Flagged:** {trip.flagReason}
              </div>
            )}
            {trip.suggestedDriver_name && (
              <div className="mt-2 text-sm text-blue-600">
                🧠  **Suggested Driver:** {trip.suggestedDriver_name}
              </div>
            )}
            {trip.statusHistory && (
              <div className="mt-3 text-xs text-gray-600">
                <p className="font-semibold">Status History:</p>
                <ul className="list-disc ml-4">
                  {trip.statusHistory.map((entry, i) => (
                    <li key={i}>
                      {entry.status} @ {new Date(entry.timestamp).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {trip.coordinates && (
              <>
                <button
                  onClick={() => setShowReplay(showReplay === trip.id ? null : trip.id)}
                  className="mt-4 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  {showReplay === trip.id ? ' ⏹  Stop Replay' : ' ▶️  Replay Trip'}
                </button>
                {showReplay === trip.id && <TripReplay coordinates={trip.coordinates} />}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};
const TripList = ({ trips, onTripSelect }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">My Trips</h2>
      {trips.length === 0 ? (
        <p className="text-gray-500">No trips found.</p>
      ) : (
        trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white p-4 rounded-lg shadow-md border hover:bg-gray-50 cursor-pointer"
            onClick={() => onTripSelect(trip)}
          >
            <p>
              **From:** {trip.origin}
            </p>
            <p>
              **To:** {trip.destination}
            </p>
          </div>
        ))
      )}
    </div>
  );
};
const TripDetails = ({ trip }) => {
  if (!trip) {
    return (
      <div className="text-center p-10 text-gray-600">
        Select a trip from **"My Trips"** to see the details.
      </div>
    );
  }
  const { analysis = {}, routeData } = trip;
  const { profitability, ifta, remarks, dailyLogs } = analysis;
  return (
    <div className="space-y-6">
      <TripHeader trip={trip} />
      <TripMap routeData={routeData} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {profitability ? (
          <ProfitabilityCard data={profitability} />
        ) : (
          <PlaceholderCard title="Profitability" />
        )}
        {ifta ? (
          <IftaCard data={ifta} />
        ) : (
          <PlaceholderCard title="IFTA Summary" />
        )}
        <DocumentsCard tripId={trip.id} />
      </div>
      {remarks ? (
        <HosComplianceCard remarks={remarks} />
      ) : (
        <PlaceholderCard title="HOS Compliance" />
      )}
      {Array.isArray(dailyLogs) && dailyLogs.length > 0 ? (
        <div className="space-y-4">
          {dailyLogs.map((log, index) => (
            <EldLogVisualizer key={index} dailyLog={log} />
          ))}
        </div>
      ) : (
        <PlaceholderCard title="ELD Logs" />
      )}
    </div>
  );
};
const MaintenanceTracker = ({ vehicle, setVehicle }) => {
  const [newEvent, setNewEvent] = useState({ event: 'Oil Change', mileage: vehicle.odometer });
  const handleAddLog = (e) => {
    e.preventDefault();
    const updatedVehicle = {
      ...vehicle,
      maintenanceLogs: [{ ...newEvent, date: new Date().toISOString().split('T')[0] }, ...vehicle.maintenanceLogs]
    };
    setVehicle(updatedVehicle);
    // In a real app: POST to `/api/vehicles/{vehicle.id}/maintenance`
  };
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Maintenance Tracker</h1>
      <p className="text-gray-600 mb-6">Current Odometer: {vehicle.odometer} mi</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="font-bold mb-4">Log New Maintenance</h2>
          <form onSubmit={handleAddLog} className="space-y-3">
            <select value={newEvent.event} onChange={e => setNewEvent({ ...newEvent, event: e.target.value })} className="p-2 border rounded-lg w-full">
              {Object.keys(vehicle.maintenanceSchedule).map(evt => <option key={evt} value={evt}>{evt}</option>)}
            </select>
            <input type="number" value={newEvent.mileage} onChange={e => setNewEvent({ ...newEvent, mileage: e.target.value })} className="p-2 border rounded-lg w-full" />
            <button type="submit" className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Add Log</button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="font-bold mb-4">Upcoming Service</h2>
          <ul className="space-y-2">
            {Object.entries(vehicle.maintenanceSchedule).map(([event, interval]) => {
              const last = vehicle.maintenanceLogs.find(log => log.event === event);
              const due = (last ? last.mileage : 0) + interval;
              const dueIn = due - vehicle.odometer;
              return (
                <li key={event} className="flex justify-between items-center text-sm">
                  <span>{event}</span>
                  <span className={`font-bold ${dueIn < 1000 ? 'text-red-500' : 'text-green-600'}`}>
                    Due in {dueIn} mi
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md border mt-6">
        <h2 className="font-bold mb-4">Maintenance History</h2>
        <ul className="space-y-2">
          {vehicle.maintenanceLogs.map((log, i) => (
            <li key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
              <span>{log.event}</span>
              <span>{new Date(log.date).toLocaleDateString()} at {log.mileage} mi</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
// --- TRIP DETAILS SUB-COMPONENTS ---
const TripHeader = ({ trip }) => <div><h1 className="text-4xl font-bold">{trip.origin} → {trip.destination}</h1><p className="text-gray-600">Complete Trip & Compliance Breakdown</p></div>;
const TripMap = ({ routeData }) => <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg border"><Map initialViewState={{ longitude: routeData.geometry.coordinates[0][0], latitude: routeData.geometry.coordinates[0][1], zoom: 5 }} mapboxAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle="mapbox://styles/mapbox/streets-v11"><Source id="route" type="geojson" data={routeData.geometry}><Layer type="line" layout={{ 'line-join': 'round', 'line-cap': 'round' }} paint={{ 'line-color': '#0070f3', 'line-width': 6 }} /></Source><Marker longitude={routeData.geometry.coordinates[0][0]} latitude={routeData.geometry.coordinates[0][1]}><div className="bg-white p-1 rounded-full shadow-md"><Truck color="green" /></div></Marker><Marker longitude={routeData.geometry.coordinates.slice(-1)[0][0]} latitude={routeData.geometry.coordinates.slice(-1)[0][1]}><div className="bg-white p-1 rounded-full shadow-md"><Star color="red" /></div></Marker></Map></div>;
const ProfitabilityCard = ({ data }) => {
  const [rate, setRate] = useState(data.inputs.ratePerMile);
  const [mpg, setMpg] = useState(data.inputs.fuelMpg);
  const [fuelPrice, setFuelPrice] = useState(data.inputs.fuelPrice);
  // This calculation would happen on the backend in a real app
  const revenue = data.distanceMiles * rate;
  const fuelCost = (data.distanceMiles / mpg) * fuelPrice;
  const profit = revenue - fuelCost - data.otherCosts;
  return (
    <div className="bg-white p-4 rounded-xl shadow border col-span-1 lg:col-span-1">
      <h3 className="font-bold flex items-center space-x-2 mb-2"><DollarSign size={18} className="text-green-500" /><span>Profitability Calculator</span></h3>
      <div className="text-sm space-y-2">
        <div><label>Rate per Mile ($)</label><input type="number" value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="p-1 border rounded w-full" /></div>
        <div><label>Fuel MPG</label><input type="number" value={mpg} onChange={e => setMpg(parseFloat(e.target.value))} className="p-1 border rounded w-full" /></div>
        <div><label>Fuel Price ($/gal)</label><input type="number" value={fuelPrice} onChange={e => setFuelPrice(parseFloat(e.target.value))} className="p-1 border rounded w-full" /></div>
      </div>
      <hr className="my-2" />
      <div className="text-sm space-y-1">
        <p><strong>Est. Revenue:</strong> <span className="float-right">${revenue.toFixed(2)}</span></p>
        <p><strong>Fuel Cost:</strong> <span className="float-right text-red-500">-${fuelCost.toFixed(2)}</span></p>
        <p><strong>Other Costs:</strong> <span className="float-right text-red-500">-${data.otherCosts.toFixed(2)}</span></p>
        <hr className="my-1" />
        <p className="font-bold text-base">Est. Profit: <span className="float-right text-green-600">${profit.toFixed(2)}</span></p>
      </div>
    </div>
  );
};
const IftaCard = ({ data }) => (
  <div className="bg-white p-4 rounded-xl shadow border col-span-1 lg:col-span-1">
    <h3 className="font-bold flex items-center space-x-2 mb-2"><Fuel size={18} className="text-orange-500" /><span>IFTA Estimation</span></h3>
    <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left">Province</th><th className="text-right">Miles</th></tr></thead>
      <tbody>{data.milesByState.map(s => <tr key={s.state}><td>{s.state}</td><td className="text-right">{s.miles.toFixed(0)}</td></tr>)}</tbody>
    </table>
    <p className="font-bold mt-2">Est. Tax: <span className="float-right">{data.estimatedTax}</span></p>
  </div>
);
const DocumentsCard = ({ tripId }) => {
  const [files, setFiles] = useState([]);
  const onDrop = useCallback(acceptedFiles => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    // Real app: POST files to `/api/trips/{tripId}/documents`
  }, []);
  const removeFile = (fileToRemove) => setFiles(files.filter(file => file !== fileToRemove));
  return (
    <div className="bg-white p-4 rounded-xl shadow border col-span-1 lg:col-span-1">
      <h3 className="font-bold flex items-center space-x-2 mb-2"><FileText size={18} className="text-indigo-500" /><span>Trip Documents</span></h3>
      <div className="w-full bg-gray-50 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
        <input id="file-upload" type="file" multiple className="hidden" onChange={(e) => onDrop(Array.from(e.target.files))} />
        <UploadCloud className="mx-auto text-gray-400 w-10 h-10 mb-2" />
        <p className="text-sm text-gray-600">Drop files or click to upload</p>
      </div>
      <div className="mt-2 space-y-1">
        {files.map((file, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-100 p-1 rounded text-sm">
            <span className="truncate">{file.name}</span>
            <button onClick={() => removeFile(file)}><Trash2 className="w-4 h-4 text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};
const HosComplianceCard = ({ remarks }) => <div className="bg-white p-6 rounded-xl shadow border"><h3 className="font-bold mb-4 flex items-center space-x-2"><ShieldCheck size={20} /><span>HOS Compliance Plan</span></h3><ul className="text-sm space-y-2 text-gray-700 list-disc list-inside">{remarks.map((remark, i) => <li key={i}>{remark}</li>)}</ul></div>;
const EldLogVisualizer = ({ dailyLogs }) => {
  const canvasRef = useRef(null);
  useEffect(() => { dailyLogs && drawLogSheet(canvasRef, dailyLogs[0]); }, [dailyLogs]);
  return <div className="bg-white p-6 rounded-xl shadow border"><h3 className="font-bold mb-4">Driver's Daily Log (Day 1)</h3><canvas ref={canvasRef} width="800" height="300" className="w-full h-auto bg-white rounded-lg border border-gray-300"></canvas></div>;
};
// --- WIDGETS ---
const InfoCard = ({ title, value, subtitle, icon, onClick, isClickable }) => (
  <div onClick={onClick} className={`bg-white p-6 rounded-xl shadow-md border ${isClickable ? 'cursor-pointer hover:border-blue-500' : ''}`}>
    <div className="flex items-center space-x-4">
      <div className="bg-gray-100 p-3 rounded-lg">{icon}</div>
      <div><h3 className="font-semibold text-gray-600">{title}</h3><p className="text-3xl font-bold text-gray-800">{value}</p><span className="text-sm text-gray-500">{subtitle}</span></div>
    </div>
  </div>
);
// --- SIMULATED BACKEND LOGIC ---
// This section simulates your backend. Replace these functions with authenticated API calls.
const FAKE_BACKEND_tripAnalysis = async (form, userId) => {
  const originCoords = await geocode(form.origin);
  const destCoords = await geocode(form.destination);
  if (!originCoords || !destCoords) throw new Error("Could not find locations.");
  const routeData = await fetchRoute(originCoords, destCoords);
  if (!routeData) throw new Error("No route found.");
  const analysis = analyzeTrip(routeData, form.cycleUsed);
  return { userId, ...form, createdAt: serverTimestamp(), routeData, analysis };
};
async function geocode(address) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.features?.length > 0) return { lng: data.features[0].center[0], lat: data.features[0].center[1] };
  return null;
}
async function fetchRoute(origin, destination) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_ACCESS_TOKEN}&overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  return data.routes?.[0] ?? null;
}
function analyzeTrip(routeData, currentCycleUsed) {
  const distanceMiles = routeData.distance * 0.000621371;
  const durationHours = routeData.duration / 3600;
  const logs = [
    { day: 1, status: 'On Duty', duration: 1 },
    { day: 1, status: 'Driving', duration: 5.5 },
    { day: 1, status: 'Off Duty', duration: 0.5 },
    { day: 1, status: 'Driving', duration: 5.5 },
    { day: 1, status: 'On Duty', duration: 1 },
    { day: 1, status: 'Off Duty', duration: 10 }
  ];
  // 🧠  Detect break compliance
  const breakTaken = logs.some(log => log.status === 'Off Duty' && log.duration >= 0.5);
  const offDutyHours = logs
    .filter(log => log.status === 'Off Duty')
    .reduce((sum, log) => sum + log.duration, 0);
  // 📈  Fleet Health Scoring
  function scoreTrip() {
    let score = 100;
    if (durationHours > 11) score -= 20;
    if (currentCycleUsed > 70) score -= 15;
    if (!breakTaken) score -= 10;
    if (offDutyHours < 10) score -= 10;
    return Math.max(score, 0);
  }
  return {
    distanceMiles,
    durationHours,
    remarks: [
      `Trip is ~${distanceMiles.toFixed(0)} miles and will require ${durationHours.toFixed(1)} hours of driving.`,
      `Day 1: Max 11 hours driving within a 14-hour on-duty window.`,
      `A 30-minute break is mandatory after 8 cumulative hours of driving.`,
      `A 10-hour off-duty break is required at the end of the day.`,
      `Fleet Health Score: ${scoreTrip()} / 100`
    ],
    dailyLogs: logs,
    breakTaken,
    offDutyHours,
    healthScore: scoreTrip(),
    profitability: {
      inputs: {
        ratePerMile: 3.50,
        fuelMpg: 6.5,
        fuelPrice: 3.89
      },
      distanceMiles,
      otherCosts: 125
    },
    ifta: {
      estimatedTax: '$95.20',
      milesByState: [
        { state: 'Eastern Cape', miles: 250 },
        { state: 'Western Cape', miles: 465 }
      ]
    }
  };
}
function drawLogSheet(canvasRef, dayLog) { /* ... same as previous ... */ }
const getNextService = (vehicle) => {
  let nextService = { event: 'N/A', dueInMiles: Infinity };
  Object.entries(vehicle.maintenanceSchedule).forEach(([event, interval]) => {
    const last = vehicle.maintenanceLogs.find(log => log.event === event);
    const due = (last ? last.mileage : 0) + interval;
    const dueIn = due - vehicle.odometer;
    if (dueIn < nextService.dueInMiles) {
      nextService = { event, dueInMiles: dueIn };
    }
  });
  return nextService;
}; // ✅  This closes the function correctly
export default App;