import React, { useState, useEffect } from 'react';
import TripDashboard from '../components/TripDashboard';
import ExportButton from '../components/ExportButton';
import SidebarLayout from '../components/SidebarLayout';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, messaging } from '../firebase';
import { getToken } from 'firebase/messaging';
import getOptimalRoute from '../utils/routeOptimizer';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [role, setRole] = useState(null);
  const [driverFilter, setDriverFilter] = useState('');
  const [minProfit, setMinProfit] = useState(0);
  const [maxFuel, setMaxFuel] = useState(9999);
  const [sortBy, setSortBy] = useState('date');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoleAndTrips = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      // Push notification setup
      if ('Notification' in window && 'serviceWorker' in navigator) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const token = await getToken(messaging, {
              vapidKey: 'BGg5o1gxS60Zbw8_XVKalgqAQv4G-wnzx5AQnYryf-J4I5kHf86xRREOW2MRuxNiRk7UMol_YguUfaUw67cv7bY'
            });
            await setDoc(doc(db, 'users', user.uid), { fcmToken: token }, { merge: true });
          }
        } catch (err) {
          console.error('FCM setup error:', err);
        }
      }

      // Fetch role
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userRole = userSnap.exists() ? userSnap.data().role : 'driver';
      setRole(userRole);

      // Fetch trips
      const snapshot = await getDocs(collection(db, 'trips'));
      const allTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const visibleTrips = userRole === 'driver'
        ? allTrips.filter(t => t.driver_uid === user.uid)
        : allTrips;

      setTrips(visibleTrips);
      setLoading(false);
    };

    fetchUserRoleAndTrips();
  }, []);

  useEffect(() => {
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  const handleCompleteTrip = async (trip) => {
    try {
      const res = await fetch('/api/tripComplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip, vehicleId: trip.vehicle_id })
      });

      const result = await res.json();
      if (result.success) {
        await setDoc(doc(db, 'trips', trip.id), {
          status: 'completed',
          completedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        console.error('Trip completion failed:', result.error);
      }
    } catch (err) {
      console.error('API error:', err);
    }
  };

  const filteredTrips = trips
    .filter(t => t.driver_name?.toLowerCase().includes(driverFilter.toLowerCase()))
    .filter(t => (t.analysis?.profitability?.netProfit ?? 0) >= minProfit)
    .filter(t => (t.analysis?.ifta?.fuelUsed ?? 0) <= maxFuel)
    .filter(t => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'critical') return t.healthScore < 50 || t.status === 'critical';
      return t.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'profit') {
        return (b.analysis?.profitability?.netProfit ?? 0) - (a.analysis?.profitability?.netProfit ?? 0);
      }
      if (sortBy === 'fuel') {
        return (a.analysis?.ifta?.fuelUsed ?? 0) - (b.analysis?.ifta?.fuelUsed ?? 0);
      }
      return new Date(b.date) - new Date(a.date);
    });

  const groupedTrips = {
    pending: [],
    completed: [],
    flagged: [],
    critical: []
  };

  filteredTrips.forEach(trip => {
    const score = trip.healthScore ?? 100;
    const status = trip.status ?? 'pending';

    if (status === 'completed') groupedTrips.completed.push(trip);
    else if (status === 'flagged') groupedTrips.flagged.push(trip);
    else if (status === 'critical' || score < 50) groupedTrips.critical.push(trip);
    else groupedTrips.pending.push(trip);
  });

  if (loading || !role) {
    return (
      <SidebarLayout role="loading" title="Dashboard">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout role={role} title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Install Prompt */}
        {showInstallButton && (
          <div className="mb-4">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Install FleetTrack
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <input
            type="text"
            placeholder="Driver name"
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            className="p-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Min Profit (R)"
            value={minProfit}
            onChange={(e) => setMinProfit(Number(e.target.value))}
            className="p-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Max Fuel (L)"
            value={maxFuel}
            onChange={(e) => setMaxFuel(Number(e.target.value))}
            className="p-2 border rounded-md"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="date">Sort by Date</option>
            <option value="profit">Sort by Profit</option>
            <option value="fuel">Sort by Fuel Used</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="flagged">Flagged</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Export Button */}
        {filteredTrips.length > 0 && (role === 'admin' || role === 'analyst') && (
          <div className="mb-4">
            <ExportButton trips={filteredTrips} />
          </div>
        )}

        {/* Grouped Trips */}
        {Object.entries(groupedTrips).map(([group, trips]) => (
          trips.length > 0 && (
            <div key={group} className="space-y-4 mb-8">
              <h2 className="text-xl font-bold capitalize">
                {group === 'critical' ? '🚨 Critical Trips' : `${group.charAt(0).toUpperCase() + group.slice(1)} Trips`}
              </h2>
              {trips.map(trip => {
                const routeSuggestion = getOptimalRoute(trips, trip.origin, trip.destination);

                return (
                  <TripDashboard
                    key={trip.id}
                    trip={trip}
                    onComplete={handleCompleteTrip}
                    isOffline={!navigator.onLine}
                    isSelected={false}
                    onSelect={() => {}}
                    routeSuggestion={routeSuggestion}
                  />
                );
              })}
            </div>
          )
        ))}

        {filteredTrips.length === 0 && (
          <p className="text-gray-500">No trips match the current filters.</p>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;