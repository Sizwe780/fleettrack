import React, { useEffect, useState } from "react";
import logFleetAlert from "../utils/logFleetAlert";

// Core Panels
import FleetAlerts from "./FleetAlerts";
import TripPlanner from "./TripPlanner";

// FleetTrack Engines
import FleetStressMonitor from "./engine/FleetStressMonitor";
import DriverFatigueEstimator from "./engine/DriverFatigueEstimator";
import DispatchOptimizer from "./engine/DispatchOptimizer";
import IncidentEscalationProtocols from "./engine/IncidentEscalationProtocols";
import TelemetryIntegrityValidator from "./engine/TelemetryIntegrityValidator";
import TripClusteringEngine from "./engine/TripClusteringEngine";

// Icons
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  BoltIcon,
  SignalIcon,
  MapIcon,
  UserIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";

// Intelligence Motion
import IntelligenceMotion from "./IntelligenceMotion";

// CenturionGrid ∞ Prediction Feed
import useCenturionSimulation from "../hooks/useCenturionSimulation";
import FleetPredictionFeed from "./FleetPredictionFeed";

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [fleetStatus, setFleetStatus] = useState("Operational");
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  const { feed } = useCenturionSimulation({ seed: "fleettrack", daysAhead: 2 });

  useEffect(() => {
    logFleetAlert("Dashboard initialized", "info");

    const mockAlerts = [
      { message: "SLA breach detected on Route 7", level: "error" },
      { message: "Delayed dispatch from Depot 3", level: "warn" },
      { message: "All systems nominal", level: "info" }
    ];

    setAlerts(mockAlerts);

    const syncInterval = setInterval(() => {
      const time = new Date().toLocaleTimeString();
      setLastSync(time);
      logFleetAlert(`Dashboard sync at ${time}`, "info");
    }, 60000);

    return () => clearInterval(syncInterval);
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto mt-10 px-4 space-y-10">
      {/* 🛡️ Fleet Status Overview */}
      <section className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
              Fleet Status <IntelligenceMotion />
            </h2>
            <p className="text-sm text-indigo-600">{fleetStatus}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500 italic">Last synced: {lastSync}</div>
      </section>

      {/* 🚨 Fleet Alerts */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800">Fleet Alerts</h2>
        </div>
        <FleetAlerts alerts={alerts} status={fleetStatus} />
      </section>

      {/* 🧭 Trip Planning */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🧭 Plan a New Trip</h2>
        <TripPlanner />
      </section>

      {/* ⚙️ Dispatch Optimizer */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Dispatch Optimization</h2>
        </div>
        <DispatchOptimizer />
      </section>

      {/* 🧬 Driver Fatigue Estimator */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <UserIcon className="h-6 w-6 text-yellow-600" />
          <h2 className="text-xl font-bold text-gray-800">Driver Fatigue Estimator</h2>
        </div>
        <DriverFatigueEstimator />
      </section>

      {/* ⚡ Fleet Stress Monitor */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <BoltIcon className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Fleet Stress Monitor</h2>
        </div>
        <FleetStressMonitor />
      </section>

      {/* 🧠 Incident Escalation Protocols */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <SignalIcon className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-800">Incident Escalation Protocols</h2>
        </div>
        <IncidentEscalationProtocols />
      </section>

      {/* 📡 Telemetry Integrity Validator */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <MapIcon className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Telemetry Integrity</h2>
        </div>
        <TelemetryIntegrityValidator />
      </section>

      {/* 🧭 Trip Clustering Engine */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Trip Clustering Engine</h2>
        <TripClusteringEngine />
      </section>

      {/* 🔮 CenturionGrid ∞ Predictions */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <LightBulbIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">CenturionGrid ∞ Predictions</h2>
        </div>
        <FleetPredictionFeed feed={feed} />
      </section>

      {/* 🧠 FleetQ Cognition Triggers */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <LightBulbIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">FleetQ Cognition</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <a href="/quantum-loop" className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200">
            Run Quantum Loop
          </a>
          <a href="/causal-reactor" className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200">
            Run Causal Reactor
          </a>
          <a href="/cancer-resolver" className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200">
            Simulate Cancer Resolution
          </a>
          <a href="/lottery-predictor" className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200">
            Predict Lottery Sequence
          </a>
        </div>
      </section>

      {/* 🎓 Student Co-Pilot Console */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <UserIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Student Co-Pilot Console</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Access your certification, training simulations, and progress tracking.
        </p>
        <a href="/cockpit/student" className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200">
  Launch Student Console
</a>
</section>
</div>
);
};

export default Dashboard;