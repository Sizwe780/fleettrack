import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TripDashboard from '../components/TripDashboard';
import ExportButton from '../components/ExportButton';
import SidebarLayout from '../components/SidebarLayout';
import FleetHeatmap from '../components/FleetHeatmap';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  addDoc,
  query,
  where
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, messaging } from '../firebase';
import { getToken } from 'firebase/messaging';
import getOptimalRoute from '../utils/routeOptimizer';
import evaluateTripRisk from '../utils/tripFlagger';
import FleetComplianceSuite from '../components/FleetComplianceSuite';

const Dashboard = () => {
  const location = useLocation();
  const newTripId = location.state?.newTripId || null;

  const [trips, setTrips] = useState([]);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noSnap, setNoSnap] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole('driver');
        setTrips([]);
        setLoading(false);
        return;
      }

      setUserId(user.uid);

      // FCM setup
      if ('Notification' in window && 'serviceWorker' in navigator) {
        try {
          if (Notification.permission === 'granted') {
            const vapidKey = 'YOUR_VAPID_KEY';
            const urlBase64ToUint8Array = (base64String) => {
              const padding = '='.repeat((4 - base64String.length % 4) % 4);
              const base64 = (base64String + padding)
                .replace(/-/g, '+')
                .replace(/_/g, '/');
              const rawData = window.atob(base64);
              return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
            };
            const token = await getToken(messaging, {
              vapidKey: urlBase64ToUint8Array(vapidKey)
            });
            await setDoc(doc(db, 'users', user.uid), { fcmToken: token }, { merge: true });
          }
        } catch (err) {
          console.warn('FCM setup error:', err.message);
        }
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userRole = userSnap.exists() ? userSnap.data().role : 'driver';
        setRole(userRole);

        let unsubscribeTrips;

        try {
          const tripsRef = userRole === 'admin' || userRole === 'fleet_manager'
            ? collection(db, 'apps/fleet-track-app/trips')
            : query(
                collection(db, 'apps/fleet-track-app/trips'),
                where('driver_uid', '==', user.uid)
              );

          unsubscribeTrips = onSnapshot(tripsRef, (snapshot) => {
            const allTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTrips(allTrips);
            setLoading(false);

            if (newTripId) {
              setTimeout(() => {
                document.getElementById(`trip-${newTripId}`)?.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            }
          }, (error) => {
            console.error('Snapshot listener error:', error.message);
            setNoSnap(true);
          });
        } catch (listenerErr) {
          console.error('Listener setup failed:', listenerErr.message);
          setNoSnap(true);
        }

        return () => {
          unsubscribe();
          if (unsubscribeTrips) unsubscribeTrips();
        };
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setRole('driver');
        setTrips([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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

  const logAuditTrail = async (tripId, userId, action, reason) => {
    const path = `apps/fleet-track-app/trips/${tripId}/auditTrail`;
    await addDoc(collection(db, path), {
      action,
      actor: userId,
      timestamp: new Date().toISOString(),
      reason
    });
  };

  const handleCompleteTrip = async (trip) => {
    try {
      if (role !== 'driver') return;

      const currentStatus = trip.status ?? 'pending';
      const allowedTransitions = { pending: 'departed', departed: 'completed' };
      const nextStatus = allowedTransitions[currentStatus];
      if (!nextStatus) return;

      const updatedHistory = Array.isArray(trip.statusHistory)
        ? [...trip.statusHistory, { status: nextStatus, timestamp: new Date().toISOString() }]
        : [{ status: nextStatus, timestamp: new Date().toISOString() }];

      const path = `apps/fleet-track-app/trips/${trip.id}`;
      await setDoc(doc(db, path), {
        status: nextStatus,
        statusHistory: updatedHistory,
        ...(nextStatus === 'completed' && { completedAt: new Date().toISOString() })
      }, { merge: true });

      await logAuditTrail(trip.id, trip.driver_uid, `Trip marked as ${nextStatus}`, 'Status transition via dashboard');

      const { shouldFlag, reasons } = evaluateTripRisk(trip);
      if (shouldFlag) {
        await setDoc(doc(db, path), {
          status: 'critical',
          flaggedAt: new Date().toISOString(),
          flagReason: reasons.join(', ')
        }, { merge: true });

        await logAuditTrail(trip.id, trip.driver_uid, 'Trip auto-flagged as critical', reasons.join(', '));
      }
    } catch (err) {
      console.error('TripStatusEngine error:', err);
    }
  };

  const filteredTrips = trips;

  return (
    <SidebarLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Fleet Dashboard</h1>
        {loading ? (
          <p>Loading trips...</p>
        ) : (
          <>
            {filteredTrips.map(trip => {
              const routeSuggestion = getOptimalRoute(trips, trip.origin, trip.destination);
              return (
                <div key={trip.id} id={`trip-${trip.id}`}>
                  <TripDashboard
                    trip={trip}
                    onComplete={handleCompleteTrip}
                    isOffline={!navigator.onLine}
                    isSelected={false}
                    onSelect={() => {}}
                    routeSuggestion={routeSuggestion}
                  />
                </div>
              );
            })}
            <FleetComplianceSuite trips={filteredTrips} contracts={[{ id: 'contract-001', slaHours: 4 }]} />
          </>
        )}
        {showInstallButton && (
          <button
            onClick={handleInstallClick}
            className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            📲 Install FleetTrack
          </button>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;