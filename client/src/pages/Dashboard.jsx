import React, { useEffect, useState } from "react";
import logFleetAlert from "../utils/logFleetAlert";
import FleetAlerts from "./FleetAlerts";
import TripPlanner from "../components/TripPlanner";

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [fleetStatus, setFleetStatus] = useState("Operational");

  useEffect(() => {
    logFleetAlert("Dashboard initialized", "info");

    const mockAlerts = [
      { message: "SLA breach detected on Route 7", level: "error" },
      { message: "Delayed dispatch from Depot 3", level: "warn" },
      { message: "All systems nominal", level: "info" }
    ];

    setAlerts(mockAlerts);
  }, []);

  return (
    <div className="dashboard space-y-6 px-6 py-8">
      {/* 🧭 Fleet Status */}
      <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-800">Fleet Status</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            fleetStatus === "Operational"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {fleetStatus}
        </span>
      </div>

      {/* 🚨 Fleet Alerts */}
      <FleetAlerts alerts={alerts} />

      {/* 📝 Trip Planner */}
      <section className="bg-white border border-gray-300 rounded-xl shadow-md p-6">
        <TripPlanner />
      </section>
    </div>
  );
};

export default Dashboard;