import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, db, logResponderAction } from "./firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

// Core cockpit modules
import SidebarLayout from "./components/SidebarLayout";
import TripDashboard from "./components/TripDashboard";
import TripPlanner from "./components/TripPlanner";
import TripMap from "./components/TripMap";

// Intelligence & analytics
import Leaderboard from "./components/Leaderboard";
import HeatMap from "./components/HeatMap";

// Operational modules
import ClusterMap from "./components/ClusterMap";
import MaintenanceTracker from "./components/MaintenanceTracker";
import OfflineTripLogger from "./components/OfflineTripLogger";
import AdvancedRBACEditor from "./components/AdvancedRBACEditor";

// History & export
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

// FleetAI & Command Suite
import FleetAIConsole from "./components/FleetAIConsole";
import FleetOpsTelemetryPanel from "./components/FleetOpsTelemetryPanel";
import AdminConsole from "./components/AdminConsole";
import FleetBillingDashboard from "./components/FleetBillingDashboard";
import MobileSyncStatus from "./components/MobileSyncStatus";
import TripTamperDetector from "./components/TripTamperDetector";

// Tactical Simulation & Training
import FleetTrackGame from "./components/engine/FleetTrackGame";
import StudentPilotConsole from "./components/engine/StudentPilotConsole";
import PanicConsole from "./components/engine/PanicConsole";

// Forex Intelligence
import ForexPredictor from "./components/forex/ForexPredictor";
import ForexPaperTrader from "./components/forex/ForexPaperTrader";
import ForexExecution from "./components/forex/ForexExecution";

// Marketplace
import FleetMarket from "./components/marketplace/FleetMarket";
import CreateConsole from "./components/marketplace/CreateConsole";
import MentorshipPanel from "./components/marketplace/MentorshipPanel";

// Research & Reporting
import ResearchReportGenerator from "./components/research/ResearchReportGenerator";
import ReasearchReportDistributor from "./components/research/ResearchReportDistributor.js";
import CanvasBackground from "./components/research/CanvasBackground";

// FleetQ Cognition Modules
import FleetTrackConsole from "./components/FleetQ/FleettrackConsole";
import QuantumLoop from "./components/FleetQ/QuantumLoop";
import CausalReactor from "./components/FleetQ/CancerResolver.jsx";
import CancerResolver from "./components/FleetQ/CancerResolver";
import LotteryPredictor from "./components/FleetQ/LotteryPredictor";

// UI
import LightBulbIcon from "@heroicons/react/24/outline/LightBulbIcon";

const appId = "fleet-track-app";

export default function App() {
  const [userId, setUserId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [locationDetected, setLocationDetected] = useState(false);

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

  useEffect(() => {
    if (!userId) return;
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
  }, [userId]);

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
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              Trip Intelligence Console
              <LightBulbIcon className="h-7 w-7 text-indigo-600" />
            </h2>
          </div>

          {selectedTrip?.analysis?.routeData && (
            <TripMap
              origin={selectedTrip.origin}
              destination={selectedTrip.destination}
              routeData={selectedTrip.analysis.routeData}
            />
          )}

          <CanvasBackground trip={selectedTrip} />

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<TripDashboard trip={selectedTrip} trips={trips} onTripSelect={handleTripSelect} />} />
            <Route path="/plan" element={<TripPlanner userId={userId} onTripCreated={handleTripSelect} appId={appId} locationDetected={locationDetected} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/heatmap" element={<HeatMap />} />
            <Route path="/clustermap" element={<ClusterMap />} />
            <Route path="/maintenance" element={<MaintenanceTracker />} />
            <Route path="/offline" element={<OfflineTripLogger userId={userId} appId={appId} />} />
            <Route path="/rbac" element={<AdvancedRBACEditor userId={userId} />} />
            <Route path="/history" element={<TripHistoryViewer userId={userId} appId={appId} onTripSelect={handleTripSelect} />} />
            <Route path="/logsheet" element={<TripLogsheetViewer trip={selectedTrip} userId={userId} appId={appId} />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/chatbot" element={<FleetAssistantBot />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/about" element={<AboutFleetTrack />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/subscription" element={<SubscriptionManager userId={userId} />} />
            <Route path="/profile" element={<UserProfile user={{ uid: userId }} />} />
            <Route path="/ai-console" element={<FleetAIConsole trips={trips} selectedTrip={selectedTrip} drivers={[]} />} />
            <Route path="/telemetry" element={<FleetOpsTelemetryPanel />} />
            <Route path="/admin" element={<AdminConsole />} />
            <Route path="/billing" element={<FleetBillingDashboard />} />
            <Route path="/mobile-sync" element={<MobileSyncStatus />} />
            <Route path="/compliance" element={<TripTamperDetector />} />

            {/* 🚀 Simulation & Tactical Modules */}
            <Route path="/ops-sim" element={<FleetTrackGame />} />
            <Route path="/fleet-game" element={<FleetTrackGame />} />
            <Route path="/student-console" element={<StudentPilotConsole />} />
            <Route path="/panic-console" element={<PanicConsole userId={userId} logAction={logResponderAction} />} />

            {/* 💱 Forex Intelligence */}
            <Route path="/forex/predictor" element={<ForexPredictor />} />
            <Route path="/forex/paper-trader" element={<ForexPaperTrader />} />
            <Route path="/forex/execution" element={<ForexExecution />} />

            {/* 🛍️ Marketplace */}
            <Route path="/marketplace" element={<FleetMarket />} />
            <Route path="/publish" element={<CreateConsole />} />
            <Route path="/mentorship" element={<MentorshipPanel />} />

            {/* 📊 Research & Reporting */}
            <Route path="/reports/generate" element={<ResearchReportGenerator />} />
            <Route path="/reports/distribute" element={<ReasearchReportDistributor />} />

            {/* 🧠 FleetQ Cognition */}
            <Route path="/fleettrack-console" element={<FleetTrackConsole />} />
            <Route path="/quantum-loop" element={<QuantumLoop />} />
            <Route path="/causal-reactor" element={<CausalReactor />} />
            <Route path="/cancer-resolver" element={<CancerResolver />} />
            <Route path="/lottery-predictor" element={<LotteryPredictor />} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}