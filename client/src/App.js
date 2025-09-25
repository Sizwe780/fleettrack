// src/App.js
import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

// You have a very large component surface. Rather than list hundreds of single imports
// here, this App uses a lightweight components index that re-exports named components
// from ./components/*. This keeps App.js maintainable while preserving explicit routes.
//
// Create (if not present) src/components/index.js that exports named components you use:
// export { default as SidebarLayout } from "./SidebarLayout";
// export { default as TripDashboard } from "./TripDashboard";
// export { default as TripPlanner } from "./TripPlanner";
// ...
//
// The file below assumes such an index exists and exports the components referenced in routeConfig.
import * as C from "./components"; // C.SidebarLayout, C.TripMap, C.CenturrionGrid, etc.

import { LightBulbIcon } from "@heroicons/react/24/outline";

const appId = "fleet-track-app";

const routeConfig = [
  { path: "/", redirectTo: "/dashboard" },

  // Core cockpit
  { path: "/dashboard", comp: "TripDashboard", props: (ctx) => ({ trip: ctx.selectedTrip, trips: ctx.trips, onTripSelect: ctx.handleTripSelect }) },
  { path: "/plan", comp: "TripPlanner", props: (ctx) => ({ userId: ctx.userId, onTripCreated: ctx.handleTripSelect, appId, locationDetected: ctx.locationDetected }) },
  { path: "/map", comp: "TripMap", props: (ctx) => ({ origin: ctx.selectedTrip?.origin, destination: ctx.selectedTrip?.destination, routeData: ctx.selectedTrip?.analysis?.routeData }) },

  // Intelligence & analytics
  { path: "/leaderboard", comp: "Leaderboard" },
  { path: "/heatmap", comp: "HeatMap" },
  { path: "/fleet-analytics", comp: "FleetAnalytics" },

  // Operational
  { path: "/clustermap", comp: "ClusterMap" },
  { path: "/maintenance", comp: "MaintenanceTracker" },
  { path: "/offline", comp: "OfflineTripLogger", props: (ctx) => ({ userId: ctx.userId, appId }) },
  { path: "/rbac", comp: "AdvancedRBACEditor", props: (ctx) => ({ userId: ctx.userId }) },

  // History & exports
  { path: "/history", comp: "TripHistoryViewer", props: (ctx) => ({ userId: ctx.userId, appId, onTripSelect: ctx.handleTripSelect }) },
  { path: "/logsheet", comp: "TripLogsheetViewer", props: (ctx) => ({ trip: ctx.selectedTrip, userId: ctx.userId, appId }) },

  // Platform infra
  { path: "/notifications", comp: "NotificationCenter" },
  { path: "/chatbot", comp: "FleetAssistantBot" },
  { path: "/help", comp: "HelpCenter" },
  { path: "/about", comp: "AboutFleetTrack" },
  { path: "/contact", comp: "ContactUs" },
  { path: "/privacy", comp: "PrivacyPolicy" },
  { path: "/terms", comp: "TermsOfService" },
  { path: "/subscription", comp: "SubscriptionManager", props: (ctx) => ({ userId: ctx.userId }) },
  { path: "/profile", comp: "UserProfile", props: (ctx) => ({ user: { uid: ctx.userId } }) },

  // FleetAI & Command
  { path: "/ai-console", comp: "FleetAIConsole", props: (ctx) => ({ trips: ctx.trips, selectedTrip: ctx.selectedTrip, drivers: [] }) },
  { path: "/telemetry", comp: "FleetOpsTelemetryPanel" },
  { path: "/admin", comp: "AdminConsole" },
  { path: "/billing", comp: "FleetBillingDashboard" },
  { path: "/mobile-sync", comp: "MobileSyncStatus" },
  { path: "/compliance", comp: "TripTamperDetector" },

  // Centurion Grid (fully wired)
  { path: "/grid", comp: "CenturrionGrid", props: (ctx) => ({ userId: ctx.userId, appId, selectedTrip: ctx.selectedTrip }) },

  // Add any other explicit routes you want surfaced at top-level below.
];

const App = () => {
  const [userId, setUserId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [locationDetected, setLocationDetected] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setLoadingAuth(false);
      } else {
        signInAnonymously(auth)
          .then((res) => {
            setUserId(res.user.uid);
            setLoadingAuth(false);
          })
          .catch((err) => {
            console.error("Anonymous sign-in failed:", err);
            setLoadingAuth(false);
          });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const tripsQuery = query(
      collection(db, `apps/${appId}/trips`),
      where("driver_uid", "==", userId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(tripsQuery, (snapshot) => {
      const tripData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrips(tripData);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    try {
      navigator.geolocation.getCurrentPosition(
        () => setLocationDetected(true),
        () => setLocationDetected(false)
      );
    } catch {
      setLocationDetected(false);
    }
  }, []);

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
  };

  // helper to resolve component and props
  const renderRouteElement = (compName, extraPropsProvider) => {
    const Component = C[compName];
    if (!Component) {
      // simple fallback for missing exports
      return () => <div className="p-6">Component {compName} not found in components index.</div>;
    }
    const baseCtx = { userId, trips, selectedTrip, locationDetected, handleTripSelect };
    const extraProps = typeof extraPropsProvider === "function" ? extraPropsProvider(baseCtx) : {};
    return <Component {...baseCtx} {...extraProps} />;
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Initializing FleetTrack...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f3e8ff]">
      {/* SidebarLayout expected to handle nav and RBAC state */}
      <C.SidebarLayout userId={userId} appId={appId} />

      <main className="flex-1 pt-6 px-6 flex justify-center items-start">
        <div className="w-full max-w-[1600px] h-full bg-gray-50 rounded-2xl shadow-2xl border border-gray-200 p-6 overflow-y-auto">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              Trip Intelligence Console
              <LightBulbIcon className="h-7 w-7 text-indigo-600" />
            </h2>
          </div>

          {/* Always show TripMap when selectedTrip has routeData */}
          {selectedTrip?.analysis?.routeData && C.TripMap && (
            <C.TripMap
              origin={selectedTrip.origin}
              destination={selectedTrip.destination}
              routeData={selectedTrip.analysis.routeData}
            />
          )}

          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {routeConfig.map((r) =>
                r.redirectTo ? (
                  <Route key={r.path} path={r.path} element={<Navigate to={r.redirectTo} replace />} />
                ) : (
                  <Route
                    key={r.path}
                    path={r.path}
                    element={renderRouteElement(r.comp, r.props)}
                  />
                )
              )}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default App;