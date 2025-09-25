import React from "react";
import DispatchPredictor from "./FleetAI/DispatchPredictor";
import BreachForecaster from "./FleetAI/BreachForecaster";
import DriverLoadBalancer from "./FleetAI/DriverLoadBalancer";
import RouteOptimizer from "./FleetAI/RouteOptimizer";
import ExportReadinessScanner from "./FleetAI/ExportReadinessScanner";

export default function FleetAIConsole({ trips, selectedTrip, drivers }) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">🧠 FleetAI Console</h2>
      <DispatchPredictor trip={selectedTrip} />
      <BreachForecaster trip={selectedTrip} />
      <DriverLoadBalancer drivers={drivers} />
      <RouteOptimizer trip={selectedTrip} />
      <ExportReadinessScanner trips={trips} />
    </div>
  );
}