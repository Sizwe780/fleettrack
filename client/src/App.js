// src/App.js
import React, { useState, useEffect } from 'react';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getFirestore
} from 'firebase/firestore';
import {
  initializeApp,
  getApps,
  getApp
} from 'firebase/app';
import {
  Loader,
  Truck,
  Home,
  Plus,
  ListChecks,
  Wrench,
  BarChart2,
  TrendingUp,
  ShieldCheck,
  MapPin,
  LogOut
} from 'lucide-react';
import TripPlanner from './components/TripPlanner';
import MyTripsDashboard from './components/TripDashboard';
import FleetAnalytics from './pages/FleetAnalytics';
import TripCompare from './pages/TripCompare';
import FleetHealth from './pages/FleetHealth';
import Dashboard from './pages/Dashboard';
import MaintenanceTracker from './components/MaintenanceTracker';
import SidebarLayout from './components/SidebarLayout';
// Example fix if the file is named TripsDashboard.jsx

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAla1ZaxyeLc9WBDvKbAS8I9hUZnxIWxPg",
  authDomain: "fleettrack-84eb6.firebaseapp.com",
  projectId: "fleettrack-84eb6",
  storageBucket: "fleettrack-84eb6.appspot.com",
  messagingSenderId: "918797565578",
  appId: "1:918797565578:web:34dfa9992cd5a4a3cbf773",
  measurementId: "G-MKSLF88L7C"
};

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'fleet-track-app';

const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [userId, setUserId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationDetected, setLocationDetected] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      user ? setUserId(user.uid) : signInAnonymously(auth);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    const tripsQuery = query(
      collection(db, `apps/${appId}/trips`),
      where('driver_uid', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(tripsQuery, snapshot => {
      setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    }, error => {
      console.error('Snapshot error:', error.message);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      () => setLocationDetected(true),
      () => setLocationDetected(false)
    );
  }, []);

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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full ${locationDetected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">Location {locationDetected ? 'Detected' : 'Unavailable'}</span>
            </div>
            <TripPlanner
              userId={userId}
              onTripCreated={handleTripSelect}
              appId={appId}
              locationDetected={locationDetected}
            />
          </div>
        );
      case 'my-trips':
        return <MyTripsDashboard trips={trips} onTripSelect={handleTripSelect} />;
      case 'fleet-health':
        return <FleetHealth />;
      case 'maintenance':
        return <MaintenanceTracker trips={trips} />;
      case 'analytics':
        return <FleetAnalytics />;
      case 'compare':
        return <TripCompare />;
      case 'details':
        return selectedTrip ? <Dashboard trip={selectedTrip} /> : (
          <div className="p-6 text-gray-500">No trip selected. Choose one from <strong>My Trips</strong>.</div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Welcome to FleetTrack</h2>
            <p className="text-gray-600">Select a view from the sidebar to get started.</p>
          </div>
        );
    }
  };const SidebarLayout = ({ activeView, setActiveView }) => {
    const navItems = [
      { view: 'dashboard', label: 'Dashboard', icon: <Home /> },
      { view: 'planner', label: 'New Trip', icon: <Plus /> },
      { view: 'my-trips', label: 'My Trips', icon: <ListChecks /> },
      { view: 'maintenance', label: 'Maintenance', icon: <Wrench /> },
      { view: 'analytics', label: 'Fleet Analytics', icon: <BarChart2 /> },
      { view: 'compare', label: 'Compare Trips', icon: <TrendingUp /> },
      { view: 'fleet-health', label: 'Fleet Health', icon: <ShieldCheck /> }
    ];
  
    return (
      <aside className="bg-white px-4 py-6 shadow-lg md:min-h-screen md:w-64 border-r border-gray-200 -ml-4">
        <div className="flex items-center space-x-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-800">FleetTrack</span>
        </div>
        <nav className="flex flex-col space-y-3">
          {navItems.map(({ view, label, icon }) => (
            <NavButton
              key={view}
              view={view}
              label={label}
              icon={icon}
              activeView={activeView}
              onClick={setActiveView}
            />
          ))}
        </nav>
      </aside>
    );
  };
  
  const NavButton = ({ view, label, icon, activeView, onClick }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => onClick(view)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
          isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };// Optional diagnostic overlay (if enabled in settings or debug mode)
  const DiagnosticOverlay = ({ trip }) => {
    if (!trip || !trip.debug) return null;
  
    return (
      <div className="fixed bottom-4 right-4 bg-white shadow-lg border border-gray-300 rounded-lg p-4 z-50 w-96">
        <h3 className="text-lg font-semibold mb-2 text-blue-700">Diagnostic Payload</h3>
        <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
          {JSON.stringify(trip.payload, null, 2)}
        </pre>
      </div>
    );
  };
  
  // Optional replay toggle (for compliance or audit mode)
  const ReplayToggle = ({ trip, onReplay }) => {
    if (!trip || !trip.replayEnabled) return null;
  
    return (
      <div className="flex items-center justify-between bg-gray-50 border-t border-gray-200 px-4 py-2">
        <span className="text-sm text-gray-600">Replay this journey?</span>
        <button
          onClick={() => onReplay(trip)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Replay
        </button>
      </div>
    );
  };
  
  // Optional export panel (for PDF or CSV generation)
  const ExportPanel = ({ trip }) => {
    if (!trip || !trip.exportable) return null;
  
    return (
      <div className="mt-6 border-t pt-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Export Options</h4>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Export PDF
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Export CSV
          </button>
        </div>
      </div>
    );
  };
  
  // Final JSX closure with optional overlays
    return (
      <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
        <div className="flex flex-col md:flex-row max-w-screen-xl mx-auto">
          <SidebarLayout activeView={activeView} setActiveView={setActiveView} />
          <main className="flex-1 p-4 md:p-8 bg-gray-100 overflow-y-auto">
            {renderView()}
            <DiagnosticOverlay trip={selectedTrip} />
            <ReplayToggle trip={selectedTrip} onReplay={handleTripSelect} />
            <ExportPanel trip={selectedTrip} />
          </main>
        </div>
      </div>
    );
  };
  
  export default App;