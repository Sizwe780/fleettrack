import React, { useState } from "react";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import logFleetAlert from "../utils/logFleetAlert";

const TripPlanner = ({ userId, appId, onTripCreated, locationDetected }) => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [eta, setEta] = useState("");
  const [slaThreshold, setSlaThreshold] = useState("");
  const [riskLevel, setRiskLevel] = useState("Low");
  const [status, setStatus] = useState("");

  const handlePlanTrip = async () => {
    if (!origin || !destination || !vehicleId || !driverName || !eta) {
      logFleetAlert("Trip planning failed: missing required fields", "warn");
      setStatus("Please fill in all required fields.");
      return;
    }

    if (!userId || !appId) {
      logFleetAlert("Trip creation failed: missing userId or appId", "error");
      setStatus("Trip creation failed. Missing user credentials.");
      return;
    }

    if (isNaN(new Date(eta).getTime())) {
      logFleetAlert("Trip creation failed: invalid ETA format", "error");
      setStatus("Invalid ETA. Please select a valid date and time.");
      return;
    }

    const tripPayload = {
      origin,
      destination,
      vehicleId,
      driverName,
      cargoType,
      eta,
      slaThreshold,
      riskLevel,
      timestamp: new Date().toISOString(),
      driver_uid: userId,
      offline: false
    };

    try {
      const docRef = await addDoc(collection(db, `apps/${appId}/trips`), tripPayload);
      logFleetAlert(`Trip planned: ${docRef.id}`, "info");
      setStatus(`Trip successfully planned from ${origin} to ${destination}.`);
      onTripCreated({ id: docRef.id, ...tripPayload });
    } catch (error) {
      logFleetAlert(`Trip creation failed: ${error.message}`, "error");
      setStatus("Trip creation failed. Try again.");
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-transparent pt-6">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl p-10 space-y-10 border border-gray-200">
        <div className="flex items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🧭 Welcome to FleetTrack
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origin" className="px-5 py-4 text-base rounded-lg border border-gray-400 bg-white shadow-sm" />
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination" className="px-5 py-4 text-base rounded-lg border border-gray-400 bg-white shadow-sm" />
          <input type="text" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} placeholder="Vehicle ID" className="px-5 py-4 text-base rounded-lg border border-gray-400 bg-white shadow-sm" />
          <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Driver Name" className="px-5 py-4 text-base rounded-lg border border-gray-400 bg-white shadow-sm" />
          <input type="text" value={cargoType} onChange={(e) => setCargoType(e.target.value)} placeholder="Cargo Type" className="px-5 py-4 text-base rounded-lg border border-gray-400 bg-white shadow-sm" />
          <input type="datetime-local" value={eta} onChange={(e) => setEta(e.target.value)} className="px-5 py-4 text-base rounded-lg border border-gray-400 bg-white shadow-sm" />
          <input type="number" value={slaThreshold} onChange={(e) => setSlaThreshold(e.target.value)} placeholder="SLA Threshold (min)" className="px-5 py-4 text-base rounded-lg border border-gray-400 bg-white shadow-sm" />
          <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)} className="px-5 py-4 text-base rounded-lg border border-gray-400 bg-white shadow-sm">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button type="button" onClick={handlePlanTrip} className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition">
            🚀 Plan Trip
          </button>

          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full ${locationDetected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-gray-700">
              Location {locationDetected ? "Detected" : "Unavailable"}
            </span>
          </div>
        </div>

        {status && (
          <p className="text-sm text-green-700 font-medium text-center">{status}</p>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;