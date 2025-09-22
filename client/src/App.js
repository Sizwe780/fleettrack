// --- MODULE IMPORTS ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Truck, MapPin, DollarSign, UploadCloud, ShieldCheck, FileText, Plus,
  Home, ListChecks, Loader, Car, Star, Fuel, TrendingUp, BarChart2, Wrench, Trash2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, doc, addDoc, onSnapshot, collection, serverTimestamp
} from 'firebase/firestore';

const [selectedTrip, setSelectedTrip] = useState(null);
// --- CONFIGURATION ---
const FIREBASE_CONFIG = { /* PASTE YOUR FIREBASE CONFIG HERE */ };
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

// --- FIREBASE INITIALIZATION ---
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'fleet-track-app';

// --- MAIN APP COMPONENT ---
const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [userId, setUserId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // This state would be part of a larger user/vehicle context
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
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserRole(snap.data().role);
        }
      } else {
        signInAnonymously(auth);
      }
    });
  }, []);
  

  useEffect(() => {
    if (!userId) return;
    const tripsPath = `apps/${appId}/users/${userId}/trips`;
    const unsubscribe = onSnapshot(collection(db, tripsPath), snapshot => {
      setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setActiveView('details');
  };

  const renderView = () => {
    if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader className="animate-spin w-12 h-12 text-blue-600" /></div>;
    switch (activeView) {
      case 'planner': return <TripPlanner userId={userId} onTripCreated={handleTripSelect} />;
      case 'my-trips': return <TripList trips={trips} onTripSelect={handleTripSelect} />;
      case 'maintenance': return <MaintenanceTracker vehicle={vehicle} setVehicle={setVehicle} />;
      case 'details': return <TripDetails trip={selectedTrip} />;
      default: return <Dashboard tripCount={trips.length} vehicle={vehicle} setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex flex-col md:flex-row">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 md:p-8 bg-gray-100 overflow-y-auto">{renderView()}</main>
      </div>
    </div>
  );
};

// --- LAYOUT & NAVIGATION ---

const Sidebar = ({ activeView, setActiveView }) => (
  <aside className="bg-white p-4 md:p-6 shadow-lg md:min-h-screen md:w-64 border-r border-gray-200">
    <div className="flex items-center space-x-3 mb-10">
      <div className="bg-blue-600 p-2 rounded-lg"><Truck className="w-8 h-8 text-white" /></div>
      <span className="text-2xl font-bold text-gray-800">FleetTrack</span>
    </div>
    <nav className="flex flex-col space-y-3">
      <NavButton view="dashboard" label="Dashboard" icon={<Home />} activeView={activeView} onClick={setActiveView} />
      <NavButton view="planner" label="New Trip" icon={<Plus />} activeView={activeView} onClick={setActiveView} />
      <NavButton view="my-trips" label="My Trips" icon={<ListChecks />} activeView={activeView} onClick={setActiveView} />
      <NavButton view="maintenance" label="Maintenance" icon={<Wrench />} activeView={activeView} onClick={setActiveView} />
    </nav>
  </aside>
);

const NavButton = ({ view, label, icon, activeView, onClick }) => (
  <button onClick={() => onClick(view)} className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left w-full ${activeView === view ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50'}`}>
    {icon} <span className="font-medium">{label}</span>
  </button>
);

// --- PRIMARY VIEWS ---

const Dashboard = ({ tripCount, vehicle, setActiveView }) => {
    const nextService = getNextService(vehicle);
    return(
        <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-lg text-gray-500 mb-8">Monday, 22 September 2025 - Gqeberha, EC</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <InfoCard title="HOS Status" value="8h 15m" subtitle="Driving time remaining" icon={<ShieldCheck className="text-green-500"/>} />
                <InfoCard title="Next Service Due" value={`${nextService.dueInMiles} mi`} subtitle={nextService.event} icon={<Wrench className="text-yellow-600"/>} />
                <InfoCard title="Trips This Month" value={tripCount} subtitle="View All Trips" onClick={() => setActiveView('my-trips')} isClickable={true} icon={<TrendingUp className="text-blue-500"/>} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border text-center">
                <h2 className="text-2xl font-bold mb-4">Ready for your next haul?</h2>
                <button onClick={() => setActiveView('planner')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto">
                    <Plus /><span>Plan New Trip</span>
                </button>
            </div>
        </div>
    );
};

const TripPlanner = ({ userId, onTripCreated }) => {
    const [form, setForm] = useState({ origin: 'Gqeberha, EC', destination: 'Cape Town, WC', cycleUsed: '25' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // This entire block would be a single API call to your backend.
            const newTripData = await FAKE_BACKEND_tripAnalysis(form, userId);
            
            const tripsPath = `apps/${appId}/users/${userId}/trips`;
            const docRef = await addDoc(collection(db, tripsPath), newTripData);
            onTripCreated({ id: docRef.id, ...newTripData });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Plan a New Trip</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border space-y-4">
                <input name="origin" value={form.origin} onChange={(e) => setForm({...form, origin: e.target.value})} required className="p-3 border rounded-lg w-full" />
                <input name="destination" value={form.destination} onChange={(e) => setForm({...form, destination: e.target.value})} required className="p-3 border rounded-lg w-full" />
                <input name="cycleUsed" type="number" value={form.cycleUsed} onChange={(e) => setForm({...form, cycleUsed: e.target.value})} required className="p-3 border rounded-lg w-full" />
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                    {isLoading ? <Loader className="animate-spin" /> : <Car />} <span>{isLoading ? 'Calculating...' : 'Plan My Trip'}</span>
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
        </div>
    );
};

const [userRole, setUserRole] = useState(null);

const TripList = ({ trips, onTripSelect }) => (
    <div>
        <h1 className="text-3xl font-bold mb-6">My Trips</h1>
        <div className="space-y-4">
            {trips.length > 0 ? trips.map(trip => (
                <div key={trip.id} onClick={() => onTripSelect(trip)} className="bg-white p-4 rounded-xl shadow-md border hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all">
                    <h2 className="font-bold text-lg">{trip.origin} → {trip.destination}</h2>
                    <p className="text-sm text-gray-500">Distance: {trip.analysis?.distanceMiles.toFixed(0)} mi | Profit Est: <span className="font-bold text-green-600">{trip.analysis?.profitability.profit}</span></p>
                </div>
            )) : <p>You haven't planned any trips yet. Plan your first one!</p>}
        </div>
    </div>
);

const TripDetails = ({ trip }) => {
    if (!trip) return <div className="text-center p-10">Select a trip from "My Trips" to see the details.</div>;
    return (
        <div className="space-y-6">
            <TripHeader trip={trip} />
            <TripMap routeData={trip.routeData} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ProfitabilityCard data={trip.analysis.profitability} />
                <IftaCard data={trip.analysis.ifta} />
                <DocumentsCard tripId={trip.id} />
            </div>
            <HosComplianceCard remarks={trip.analysis.remarks} />
            <EldLogVisualizer dailyLogs={trip.analysis.dailyLogs} />
        </div>
    );
};

{selectedTrip && (
  <TripInsights trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
)}

const MaintenanceTracker = ({ vehicle, setVehicle }) => {
    const [newEvent, setNewEvent] = useState({ event: 'Oil Change', mileage: vehicle.odometer });

    const handleAddLog = (e) => {
        e.preventDefault();
        const updatedVehicle = {
            ...vehicle,
            maintenanceLogs: [ { ...newEvent, date: new Date().toISOString().split('T')[0] }, ...vehicle.maintenanceLogs ]
        };
        setVehicle(updatedVehicle);
        // In a real app: POST to `/api/vehicles/{vehicle.id}/maintenance`
    };

    return(
        <div>
            <h1 className="text-3xl font-bold mb-2">Maintenance Tracker</h1>
            <p className="text-gray-600 mb-6">Current Odometer: {vehicle.odometer} mi</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border">
                    <h2 className="font-bold mb-4">Log New Maintenance</h2>
                    <form onSubmit={handleAddLog} className="space-y-3">
                        <select value={newEvent.event} onChange={e => setNewEvent({...newEvent, event: e.target.value})} className="p-2 border rounded-lg w-full">
                            {Object.keys(vehicle.maintenanceSchedule).map(evt => <option key={evt} value={evt}>{evt}</option>)}
                        </select>
                        <input type="number" value={newEvent.mileage} onChange={e => setNewEvent({...newEvent, mileage: e.target.value})} className="p-2 border rounded-lg w-full" />
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
const TripMap = ({ routeData }) => <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg border"><Map initialViewState={{ longitude: routeData.geometry.coordinates[0][0], latitude: routeData.geometry.coordinates[0][1], zoom: 5 }} mapboxAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle="mapbox://styles/mapbox/streets-v11"><Source id="route" type="geojson" data={routeData.geometry}><Layer type="line" layout={{ 'line-join': 'round', 'line-cap': 'round' }} paint={{ 'line-color': '#0070f3', 'line-width': 6 }} /></Source><Marker longitude={routeData.geometry.coordinates[0][0]} latitude={routeData.geometry.coordinates[0][1]}><div className="bg-white p-1 rounded-full shadow-md"><Truck color="green"/></div></Marker><Marker longitude={routeData.geometry.coordinates.slice(-1)[0][0]} latitude={routeData.geometry.coordinates.slice(-1)[0][1]}><div className="bg-white p-1 rounded-full shadow-md"><Star color="red"/></div></Marker></Map></div>;

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
                <div><label>Rate per Mile ($)</label><input type="number" value={rate} onChange={e=>setRate(parseFloat(e.target.value))} className="p-1 border rounded w-full"/></div>
                <div><label>Fuel MPG</label><input type="number" value={mpg} onChange={e=>setMpg(parseFloat(e.target.value))} className="p-1 border rounded w-full"/></div>
                <div><label>Fuel Price ($/gal)</label><input type="number" value={fuelPrice} onChange={e=>setFuelPrice(parseFloat(e.target.value))} className="p-1 border rounded w-full"/></div>
            </div>
            <hr className="my-2"/>
            <div className="text-sm space-y-1">
                <p><strong>Est. Revenue:</strong> <span className="float-right">${revenue.toFixed(2)}</span></p>
                <p><strong>Fuel Cost:</strong> <span className="float-right text-red-500">-${fuelCost.toFixed(2)}</span></p>
                <p><strong>Other Costs:</strong> <span className="float-right text-red-500">-${data.otherCosts.toFixed(2)}</span></p>
                <hr className="my-1"/>
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
                <input id="file-upload" type="file" multiple className="hidden" onChange={(e) => onDrop(Array.from(e.target.files))}/>
                <UploadCloud className="mx-auto text-gray-400 w-10 h-10 mb-2" />
                <p className="text-sm text-gray-600">Drop files or click to upload</p>
            </div>
            <div className="mt-2 space-y-1">
                {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-100 p-1 rounded text-sm">
                        <span className="truncate">{file.name}</span>
                        <button onClick={() => removeFile(file)}><Trash2 className="w-4 h-4 text-red-500"/></button>
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

    return {
        distanceMiles, durationHours,
        remarks: [
            `Trip is ~${distanceMiles.toFixed(0)} miles and will require ${durationHours.toFixed(1)} hours of driving.`,
            `Day 1: Max 11 hours driving within a 14-hour on-duty window.`,
            `A 30-minute break is mandatory after 8 cumulative hours of driving.`,
            `A 10-hour off-duty break is required at the end of the day.`
        ],
        dailyLogs: [{
            day: 1, segments: [{ status: 'On Duty', duration: 1 }, { status: 'Driving', duration: 5.5 }, { status: 'Off Duty', duration: 0.5 }, { status: 'Driving', duration: 5.5 }, { status: 'On Duty', duration: 1 }, { status: 'Off Duty', duration: 10 }]
        }],
        profitability: {
            inputs: { ratePerMile: 3.50, fuelMpg: 6.5, fuelPrice: 3.89 },
            distanceMiles, otherCosts: 125,
        },
        ifta: {
            estimatedTax: '$95.20',
            milesByState: [{ state: 'Eastern Cape', miles: 250 }, { state: 'Western Cape', miles: 465 }]
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
};

export default App;