// src/components/TripPlanner.jsx
import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function TripPlanner({ userId, appId, locationDetected, onTripCreated }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [driverName, setDriverName] = useState("");
  const [cargo, setCargo] = useState("");
  const [eta, setEta] = useState("");
  const [sla, setSla] = useState("");
  const [riskLevel, setRiskLevel] = useState("low");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!origin || !destination || !vehicle || !driverName || !eta) return;
    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, `apps/${appId}/trips`), {
        origin,
        destination,
        vehicle,
        driver_name: driverName,
        cargo,
        eta,
        sla,
        riskLevel,
        driver_uid: userId,
        createdAt: Timestamp.now(),
        status: "scheduled",
      });
      setOrigin("");
      setDestination("");
      setVehicle("");
      setDriverName("");
      setCargo("");
      setEta("");
      setSla("");
      setRiskLevel("low");
      if (onTripCreated) onTripCreated({ id: docRef.id, origin, destination });
    } catch (err) {
      console.error("Trip creation failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">🧭 Plan a New Trip</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          value={origin}
          onChange={e => setOrigin(e.target.value)}
          placeholder="Origin"
          className="border p-2 rounded"
        />
        <input
          value={destination}
          onChange={e => setDestination(e.target.value)}
          placeholder="Destination"
          className="border p-2 rounded"
        />
        <input
          value={vehicle}
          onChange={e => setVehicle(e.target.value)}
          placeholder="Vehicle ID"
          className="border p-2 rounded"
        />
        <input
          value={driverName}
          onChange={e => setDriverName(e.target.value)}
          placeholder="Driver Name"
          className="border p-2 rounded"
        />
        <input
          value={cargo}
          onChange={e => setCargo(e.target.value)}
          placeholder="Cargo Description"
          className="border p-2 rounded"
        />
        <input
          value={eta}
          onChange={e => setEta(e.target.value)}
          placeholder="ETA (e.g. 2025-09-26 14:00)"
          className="border p-2 rounded"
        />
        <input
          value={sla}
          onChange={e => setSla(e.target.value)}
          placeholder="SLA Target (minutes)"
          className="border p-2 rounded"
        />
        <select
          value={riskLevel}
          onChange={e => setRiskLevel(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {submitting ? "Creating..." : "Create Trip"}
      </button>

      {locationDetected && (
        <p className="text-green-600 text-sm mt-2">📍 Location detected</p>
      )}
    </div>
  );
}