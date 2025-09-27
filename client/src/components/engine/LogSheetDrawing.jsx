import React from "react";

export default function LogSheetDrawing({ trip, docId, logoUrl, remarks }) {
  const startTime = new Date(trip.timestamp?.seconds * 1000).toLocaleString();
  const duration = trip.analysis?.duration || "N/A";
  const summary = trip.analysis?.routeData?.summary || "—";
  const risk = trip.analysis || {};
  const alerts = trip.metadataFlags || [];
  const idle = trip.idleAlerts || [];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 max-w-3xl mx-auto text-sm font-sans">
      <img src={logoUrl} alt="FleetTrack ∞ Logo" className="h-12 mb-4" />
      <h2 className="text-xl font-bold mb-2">📝 Trip LogSheet</h2>
      <p className="text-xs text-gray-500 mb-4">Document ID: {docId}</p>

      <div className="space-y-2">
        <p><strong>Origin:</strong> {trip.origin}</p>
        <p><strong>Destination:</strong> {trip.destination}</p>
        <p><strong>Driver UID:</strong> {trip.driver_uid}</p>
        <p><strong>Start Time:</strong> {startTime}</p>
        <p><strong>Duration:</strong> {duration} mins</p>
        <p><strong>Route Summary:</strong> {summary}</p>
      </div>

      <hr className="my-4" />

      <div className="space-y-2">
        <h3 className="font-semibold">📊 Risk Analysis</h3>
        <p><strong>Fuel Risk:</strong> {risk.fuelRisk ?? "—"}</p>
        <p><strong>Fatigue Risk:</strong> {risk.fatigueRisk ?? "—"}</p>
        <p><strong>Delay Risk:</strong> {risk.delayRisk ?? "—"}</p>
      </div>

      <hr className="my-4" />

      <div className="space-y-2">
        <h3 className="font-semibold">📍 Alerts & Flags</h3>
        {alerts.length > 0 ? alerts.map((a, i) => (
          <p key={i}><strong>Metadata Issue:</strong> {a.issue} <span className="text-gray-500">({a.flaggedAt})</span></p>
        )) : <p>No metadata flags.</p>}
        {idle.length > 0 ? idle.map((i, j) => (
          <p key={j}><strong>Idle Alert:</strong> {i.location} for {i.duration} mins <span className="text-gray-500">({i.flaggedAt})</span></p>
        )) : <p>No idle anomalies.</p>}
      </div>

      <hr className="my-4" />

      <div>
        <h3 className="font-semibold">📝 Remarks</h3>
        <p>{remarks || "—"}</p>
      </div>
    </div>
  );
}