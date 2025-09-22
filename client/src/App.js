import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Truck, MapPin, DollarSign, UploadCloud, ShieldCheck, FileText, Plus, Home, ListChecks, Loader, Car, Star, Fuel, TrendingUp, BarChart2 } from 'lucide-react';

// --- CONFIGURATION (Replace with your actual credentials) ---
// IMPORTANT: For security, these should be stored in environment variables, not hard-coded.
const FIREBASE_CONFIG = { /* PASTE YOUR FIREBASE CONFIG HERE */ };
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg'; // Your Mapbox Token

// --- NOTE: Firebase is used for real-time data listening in this example.
// --- A full implementation would replace most logic with calls to your own secure backend API.
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';

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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) await signInAnonymously(auth);
      setUserId(auth.currentUser?.uid);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const tripsPath = `apps/${appId}/users/${userId}/trips`;
    const q = collection(db, tripsPath);
    const unsubscribeTrips = onSnapshot(q, (snapshot) => {
      const newTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(newTrips);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching trips: ", error);
      setIsLoading(false);
    });
    return () => unsubscribeTrips();
  }, [userId]);

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setActiveView('details');
  };

  const renderView = () => {
    if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader className="animate-spin w-12 h-12" /></div>;
    switch (activeView) {
      case 'planner': return <TripPlanner userId={userId} onTripCreated={handleTripSelect} />;
      case 'my-trips': return <TripList trips={trips} onTripSelect={handleTripSelect} />;
      case 'details': return <TripDetails trip={selectedTrip} />;
      default: return <Dashboard tripCount={trips.length} setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex flex-col md:flex-row">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 md:p-8 bg-gray-100">{renderView()}</main>
      </div>
    </div>
  );
};

// --- UI COMPONENTS ---

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
    </nav>
  </aside>
);

const NavButton = ({ view, label, icon, activeView, onClick }) => (
  <button onClick={() => onClick(view)} className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left w-full ${activeView === view ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50'}`}>
    {icon} <span className="font-medium">{label}</span>
  </button>
);

const Dashboard = ({ tripCount, setActiveView }) => (
  <div>
    <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
    <p className="text-lg text-gray-500 mb-8">Welcome to your command center.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InfoCard title="HOS Status" value="8h 15m" subtitle="Driving time remaining" icon={<ShieldCheck className="text-green-500"/>} />
        <InfoCard title="Total Trips Logged" value={tripCount} subtitle="This month" icon={<TrendingUp className="text-blue-500"/>} />
        <InfoCard title="Revenue" value="$14,820" subtitle="This month" icon={<BarChart2 className="text-indigo-500"/>} />
    </div>
    <div className="bg-white p-6 rounded-xl shadow-md border text-center">
        <h2 className="text-2xl font-bold mb-4">Ready for your next haul?</h2>
        <p className="text-gray-600 mb-6">Plan your route, calculate costs, and stay compliant all in one place.</p>
        <button onClick={() => setActiveView('planner')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto">
            <Plus /><span>Plan New Trip</span>
        </button>
    </div>
  </div>
);

const InfoCard = ({ title, value, subtitle, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border">
        <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-lg">{icon}</div>
            <div>
                <h3 className="font-semibold text-gray-600">{title}</h3>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <span className="text-sm text-gray-500">{subtitle}</span>
            </div>
        </div>
    </div>
);


const TripPlanner = ({ userId, onTripCreated }) => {
    const [form, setForm] = useState({ origin: 'Gqeberha, EC', destination: 'Cape Town, WC', cycleUsed: '25' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // In a real app, this entire block would be a single API call to your backend:
            // const response = await fetch('/api/trips/analyze', { method: 'POST', body: JSON.stringify(form) });
            // const newTripData = await response.json();

            // --- START: Client-Side Simulation of Backend ---
            const originCoords = await geocode(form.origin);
            const destCoords = await geocode(form.destination);
            if (!originCoords || !destCoords) throw new Error("Could not find locations.");
            
            const routeResponse = await fetchRoute(originCoords, destCoords);
            if (!routeResponse) throw new Error("No route found.");
            
            const analysis = analyzeTrip(routeResponse, form.cycleUsed); // Complex logic
            const newTripData = { userId, ...form, createdAt: serverTimestamp(), routeData: routeResponse, analysis };
            // --- END: Client-Side Simulation of Backend ---
            
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
                <input name="origin" value={form.origin} onChange={(e) => setForm({...form, origin: e.target.value})} placeholder="Origin" required className="p-3 border rounded-lg w-full" />
                <input name="destination" value={form.destination} onChange={(e) => setForm({...form, destination: e.target.value})} placeholder="Destination" required className="p-3 border rounded-lg w-full" />
                <input name="cycleUsed" type="number" value={form.cycleUsed} onChange={(e) => setForm({...form, cycleUsed: e.target.value})} placeholder="Current Cycle Used (hrs)" required className="p-3 border rounded-lg w-full" />
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    {isLoading ? <Loader className="animate-spin" /> : <Car />} <span>{isLoading ? 'Calculating...' : 'Plan My Trip'}</span>
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
        </div>
    );
};

const TripList = ({ trips, onTripSelect }) => (
    <div>
        <h1 className="text-3xl font-bold mb-6">My Trips</h1>
        <div className="space-y-4">
            {trips.length > 0 ? trips.map(trip => (
                <div key={trip.id} onClick={() => onTripSelect(trip)} className="bg-white p-4 rounded-xl shadow-md border hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all">
                    <h2 className="font-bold text-lg">{trip.origin} → {trip.destination}</h2>
                    <p className="text-sm text-gray-500">Distance: {trip.analysis?.distanceMiles.toFixed(0)} mi | Profit Est: <span className="font-bold text-green-600">{trip.analysis?.profitability.profit}</span></p>
                </div>
            )) : <p>You haven't planned any trips yet.</p>}
        </div>
    </div>
);

const TripDetails = ({ trip }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        if (trip && trip.analysis.dailyLogs) {
            drawLogSheet(canvasRef, trip.analysis.dailyLogs[0]); // Draw the first day's log
        }
    }, [trip]);

    if (!trip) return <div className="text-center p-10">Select a trip from "My Trips" to see the details.</div>;
    
    const { origin, destination, routeData, analysis } = trip;
    const { remarks, profitability, ifta, dailyLogs } = analysis;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold">{origin} → {destination}</h1>
                <p className="text-gray-600">Complete Trip & Compliance Breakdown</p>
            </div>
            
            <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg border">
                <Map initialViewState={{ longitude: routeData.geometry.coordinates[0][0], latitude: routeData.geometry.coordinates[0][1], zoom: 5 }} mapboxAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle="mapbox://styles/mapbox/streets-v11">
                    <Source id="route" type="geojson" data={routeData.geometry}><Layer type="line" layout={{ 'line-join': 'round', 'line-cap': 'round' }} paint={{ 'line-color': '#0070f3', 'line-width': 6 }} /></Source>
                    <Marker longitude={routeData.geometry.coordinates[0][0]} latitude={routeData.geometry.coordinates[0][1]}><div className="bg-white p-1 rounded-full shadow-md"><Truck color="green"/></div></Marker>
                    <Marker longitude={routeData.geometry.coordinates.slice(-1)[0][0]} latitude={routeData.geometry.coordinates.slice(-1)[0][1]}><div className="bg-white p-1 rounded-full shadow-md"><Star color="red"/></div></Marker>
                </Map>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProfitabilityCard data={profitability} />
                <IftaCard data={ifta} />
                <DocumentsCard />
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow border">
                <h3 className="font-bold mb-4 flex items-center space-x-2"><ShieldCheck size={20} /><span>HOS Compliance Plan</span></h3>
                <ul className="text-sm space-y-2 text-gray-700 list-disc list-inside">
                    {remarks.map((remark, i) => <li key={i}>{remark}</li>)}
                </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
                <h3 className="font-bold mb-4">Driver's Daily Log (Day 1)</h3>
                <canvas ref={canvasRef} width="800" height="300" className="w-full h-auto bg-white rounded-lg border border-gray-300"></canvas>
            </div>
        </div>
    );
};

const ProfitabilityCard = ({ data }) => (
    <div className="bg-white p-4 rounded-xl shadow border">
        <h3 className="font-bold flex items-center space-x-2 mb-2"><DollarSign size={18} className="text-green-500" /><span>Profitability Analysis</span></h3>
        <div className="text-sm space-y-1">
            <p><strong>Est. Revenue:</strong> <span className="float-right">$2,500.00</span></p>
            <p><strong>Fuel Cost:</strong> <span className="float-right text-red-500">-{data.fuelCost}</span></p>
            <p><strong>Tolls & Fees:</strong> <span className="float-right text-red-500">-$75.00</span></p>
            <hr className="my-1"/>
            <p className="font-bold text-base">Est. Profit: <span className="float-right text-green-600">{data.profit}</span></p>
        </div>
    </div>
);

const IftaCard = ({ data }) => (
     <div className="bg-white p-4 rounded-xl shadow border">
        <h3 className="font-bold flex items-center space-x-2 mb-2"><Fuel size={18} className="text-orange-500" /><span>IFTA Estimation</span></h3>
        <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left">State/Province</th><th className="text-right">Miles</th></tr></thead>
            <tbody>
                {data.milesByState.map(s => <tr key={s.state}><td>{s.state}</td><td className="text-right">{s.miles.toFixed(0)}</td></tr>)}
            </tbody>
        </table>
        <p className="font-bold mt-2">Est. Tax: <span className="float-right">{data.estimatedTax}</span></p>
    </div>
);

const DocumentsCard = () => (
    <div className="bg-white p-4 rounded-xl shadow border flex flex-col items-center justify-center text-center">
        <h3 className="font-bold flex items-center space-x-2 mb-2"><FileText size={18} className="text-indigo-500" /><span>Trip Documents</span></h3>
        <div className="w-full bg-gray-50 border-2 border-dashed rounded-lg p-4 mt-2">
            <UploadCloud className="mx-auto text-gray-400 w-10 h-10 mb-2" />
            <p className="text-sm text-gray-600">Drag & drop BOL, receipts, etc.</p>
        </div>
    </div>
);

// --- API & LOGIC HELPERS ---

// These functions simulate what your backend should be doing.
// Replace them with API calls to your server for 100% functionality.

async function geocode(address) { /* ... same as previous ... */ }
async function fetchRoute(origin, destination) { /* ... same as previous ... */ }

function analyzeTrip(routeData, currentCycleUsed) {
    const distanceMiles = routeData.distance * 0.000621371;
    const durationHours = routeData.duration / 3600;
    const onDutyTime = durationHours + 2; // +2 for pickup/dropoff
    
    // Simulate HOS breakdown
    const remarks = [
        `Trip is approximately ${distanceMiles.toFixed(0)} miles and will take ${durationHours.toFixed(1)} hours of driving.`,
        `Day 1: Drive up to 11 hours. A mandatory 10-hour rest will be required afterward.`,
        `Remember to take a 30-minute break after 8 hours of driving.`
    ];

    return {
        distanceMiles,
        durationHours,
        remarks,
        dailyLogs: [{
            day: 1,
            segments: [
                { status: 'On Duty', duration: 1 }, // Pickup
                { status: 'Driving', duration: 5.5 },
                { status: 'Off Duty', duration: 0.5 }, // 30-min break
                { status: 'Driving', duration: 5.5 },
                { status: 'On Duty', duration: 1 }, // Dropoff
                { status: 'Off Duty', duration: 10 }, // End of day break
            ]
        }],
        profitability: { profit: '$1,865.00', fuelCost: '$560.00' },
        ifta: {
            estimatedTax: '$95.20',
            milesByState: [
                { state: 'Eastern Cape', miles: 250 },
                { state: 'Western Cape', miles: 465 }
            ]
        }
    };
}

function drawLogSheet(canvasRef, dayLog) {
    const canvas = canvasRef.current;
    if (!canvas || !dayLog) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    const chartWidth = width - 60;
    const xOffset = 50, yOffset = 30;
    const statusRows = { 'Off Duty': 0, 'Sleeper': 1, 'Driving': 2, 'On Duty': 3 };
    const rowHeight = (height - yOffset) / 4;

    // Draw Grid & Labels
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaa';
    for (let i = 0; i <= 24; i++) {
        const x = xOffset + (i / 24) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, yOffset - 10);
        ctx.lineTo(x, height);
        ctx.strokeStyle = '#eee';
        ctx.stroke();
        if (i % 2 === 0) ctx.fillText(i, x, yOffset - 15);
    }
    
    // Draw Status Labels
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333';
    Object.entries(statusRows).forEach(([label, i]) => {
        ctx.fillText(label, 5, yOffset + (i * rowHeight) + (rowHeight / 2));
    });

    // Draw Log Data
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0070f3';
    let currentTime = 0;
    
    ctx.beginPath();
    let startY = yOffset + (statusRows['Off Duty'] * rowHeight);
    ctx.moveTo(xOffset, startY);

    dayLog.segments.forEach(segment => {
        const startX = xOffset + (currentTime / 24) * chartWidth;
        const rowIdx = statusRows[segment.status] ?? statusRows['On Duty']; // Default to 'On Duty'
        const y = yOffset + (rowIdx * rowHeight);
        ctx.lineTo(startX, y); // Vertical line to new status
        
        currentTime += segment.duration;
        const endX = xOffset + (currentTime / 24) * chartWidth;
        ctx.lineTo(endX, y); // Horizontal line for duration
    });
    ctx.stroke();
}

export default App;