import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

// Core cockpit modules
import TripPlanner from "./components/TripPlanner";
import TripDashboard from "./components/TripDashboard";
import TripMap from "./components/TripMap";
import SidebarLayout from "./components/SidebarLayout";

// Intelligence and analytics
import Leaderboard from "./components/Leaderboard";
import HeatMap from "./components/HeatMap";

// Operational modules
import ClusterMap from "./components/ClusterMap";
import Maintenance from "./components/MaintenanceTracker";
import OfflineLogger from "./components/OfflineTripLogger";
import RBACEditor from "./components/AdvancedRBACEditor";

// History and export modules
import TripHistoryViewer from "./components/TripHistoryViewer";
import TripLogsheetViewer from "./components/TripLogsheetViewer";

// Platform infrastructure
import NotificationCenter from "./components/NotificationCenter";
import FleetAssistantBot from "./components/FleetAssistantBot";
import HelpCenter from "./components/HelpCenter";
import AboutFleetTrack from "./components/AboutFleetTrack";
import ContactUs from "./components/ContactUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import SubscriptionManager from "./components/SubscriptionManager";
import UserProfile from "./components/UserProfile";

// FleetAI Console
import FleetAIConsole from "./components/FleetAIConsole";

// Command Suite
import FleetOpsTelemetryPanel from "./components/FleetOpsTelemetryPanel";
import AdminConsole from "./components/AdminConsole";
import FleetBillingDashboard from "./components/FleetBillingDashboard";
import MobileSyncStatus from "./components/MobileSyncStatus";
import TripTamperDetector from "./components/TripTamperDetector";

// UI
import LightBulbIcon from "@heroicons/react/24/outline/LightBulbIcon";

const appId = "fleet-track-app";

const App = () => {
  const [userId, setUserId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [locationDetected, setLocationDetected] = useState(false);

  // Firebase auth listener
  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid);
      } else {
        signInAnonymously(auth)
          .then(res => setUserId(res.user.uid))
          .catch(err => console.error("Anonymous sign-in failed:", err));
      }
    });
  }, []);

  // Trip sync from Firestore
  useEffect(() => {
    if (!userId) return;

    try {
      const tripsQuery = query(
        collection(db, `apps/${appId}/trips`),
        where("driver_uid", "==", userId),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(tripsQuery, snapshot => {
        const tripData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrips(tripData);
      });

      return unsubscribe;
    } catch (err) {
      console.error("Trip fetch failed:", err);
    }
  }, [userId]);

  // Location detection
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      () => setLocationDetected(true),
      () => setLocationDetected(false)
    );
  }, []);

  const handleTripSelect = trip => setSelectedTrip(trip);

  return (
    <div className="flex min-h-screen w-full bg-[#f3e8ff]">
      <SidebarLayout />
      <main className="flex-1 pt-6 px-6 flex justify-center items-start">
        <div className="w-full max-w-[1600px] h-full bg-gray-50 rounded-2xl shadow-2xl border border-gray-200 p-6 overflow-y-auto">
          {/* Trip Intelligence Console Title */}
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              Trip Intelligence Console
              <LightBulbIcon className="h-7 w-7 text-indigo-600" />
            </h2>
          </div>

          {/* Embedded Map */}
          {selectedTrip?.analysis?.routeData && (
            <TripMap
              origin={selectedTrip.origin}
              destination={selectedTrip.destination}
              routeData={selectedTrip.analysis.routeData}
            />
          )}

          {/* Routed Views */}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                <TripDashboard
                  trip={selectedTrip}
                  trips={trips}
                  onTripSelect={handleTripSelect}
                />
              }
            />
            <Route
              path="/plan"
              element={
                <TripPlanner
                  userId={userId}
                  onTripCreated={handleTripSelect}
                  appId={appId}
                  locationDetected={locationDetected}
                />
              }
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/heatmap" element={<HeatMap />} />
            <Route path="/clustermap" element={<ClusterMap />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/offline" element={<OfflineLogger userId={userId} appId={appId} />} />
            <Route path="/rbac" element={<RBACEditor userId={userId} />} />
            <Route
              path="/history"
              element={
                <TripHistoryViewer
                  userId={userId}
                  appId={appId}
                  onTripSelect={handleTripSelect}
                />
              }
            />
            <Route
              path="/logsheet"
              element={
                <TripLogsheetViewer
                  trip={selectedTrip}
                  userId={userId}
                  appId={appId}
                />
              }
            />

            {/* Platform routes */}
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/chatbot" element={<FleetAssistantBot />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/about" element={<AboutFleetTrack />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/subscription" element={<SubscriptionManager userId={userId} />} />
            <Route path="/profile" element={<UserProfile user={{ uid: userId }} />} />

            {/* FleetAI Console */}
            <Route path="/ai-console" element={<FleetAIConsole trips={trips} selectedTrip={selectedTrip} drivers={[]} />} />

            {/* Command Suite */}
            <Route path="/telemetry" element={<FleetOpsTelemetryPanel />} />
            <Route path="/admin" element={<AdminConsole />} />
            <Route path="/billing" element={<FleetBillingDashboard />} />
            <Route path="/mobile-sync" element={<MobileSyncStatus />} />
            <Route path="/compliance" element={<TripTamperDetector />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;