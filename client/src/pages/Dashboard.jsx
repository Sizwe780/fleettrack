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
    <div className="dashboard">
      <section>
        <TripPlanner />
      </section>
    </div>
  );
};

export default Dashboard;