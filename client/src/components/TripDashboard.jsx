import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// ✅ Core trip modules
import TripReplayWithStops from './TripReplayWithStops';
import TripStatusManager from './TripStatusManager';
import TripStatusBadge from './TripStatusBadge';
import ComplianceSummary from './ComplianceSummary';
import TripProfitCard from './TripProfitCard';
import IncidentReporter from './IncidentReporter';
import TripInsightsPanel from './TripInsightsPanel';
import TripSignatureBlock from './TripSignatureBlock';
import AuditTrailViewer from './AuditTrailViewer';
import TripMap from './TripMap';
import LogsheetCanvas from './LogsheetCanvas';

// ✅ Fixed local components
import FleetTrackExportConsole from './FleetTrackExportConsole';
import TripExportPreview from './TripExportPreview';
import DriverLeaderboard from './DriverLeaderboard';
import FleetHeatmap from './FleetHeatmap';
import TripClusterMap from './TripClusterMap';
import MaintenanceTracker from './MaintenanceTracker';
import OfflineTripLogger from './OfflineTripLogger';
import SyncStatusTracker from './SyncStatusTracker';
import NotificationCenter from './NotificationCenter';
import ExportButton from './ExportButton';
import BatchExportPanel from './BatchExportPanel';
import TripExportSignatureBlock from './TripExportSignatureBlock';
import AdvancedRBACEditor from './AdvancedRBACEditor';
import FirestoreRuleVisualizer from './FirestoreRuleVisualizer';
import RBACValidator from './RBACValidator';

export default function TripDashboard({ userId }) {
  const [trips, setTrips] = useState([]);
  const [showReplay, setShowReplay] = useState(null);

  useEffect(() => {
    const path = `apps/fleet-track-app/trips`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const entries = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(t => t.driver_uid === userId);
      const sorted = entries.sort((a, b) =>
        new Date(b.createdAt ?? b.date) - new Date(a.createdAt ?? a.date)
      );
      setTrips(sorted);
    });

    return () => unsubscribe();
  }, [userId]);

  const avgHealthScore = Math.round(
    trips.reduce((sum, t) => sum + (t.healthScore ?? 0), 0) / (trips.length || 1)
  );

  const avgProfit = Math.round(
    trips.reduce((sum, t) => sum + (t.analysis?.profitability?.netProfit ?? 0), 0) / (trips.length || 1)
  );

  const flaggedTrips = trips.filter(t => t.status === 'critical');

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-8">
      <h2 className="text-2xl font-bold">🚚 Fleet Intelligence Console</h2>

      {/* Fleet Health Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
        <div className="bg-green-50 p-3 rounded">
          <p className="font-semibold">Avg Fleet Score</p>
          <p>{avgHealthScore}/100</p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="font-semibold">Trips This Month</p>
          <p>{trips.length}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <p className="font-semibold">Flagged Trips</p>
          <p>{flaggedTrips.length}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <p className="font-semibold">Avg Profit</p>
          <p>R{avgProfit}</p>
        </div>
      </div>

      {/* Compliance Export */}
      <button
        onClick={() => console.log('Exporting audit logs...')}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
      >
        🧾 Export Compliance Logs
      </button>

      {/* Trip Cards */}
      {trips.length === 0 ? (
        <p className="text-sm text-gray-500 mt-4">No trips found. Submit one to get started.</p>
      ) : (
        trips.map(trip => (
          <div
            key={trip.id}
            className={`p-4 rounded-xl shadow-md border ${
              trip.status === 'critical' ? 'border-red-500 bg-red-50' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">
                {trip.origin} → {trip.destination}
              </h3>
              <TripStatusBadge status={trip.status} />
            </div>

            <TripStatusManager trip={trip} onStatusUpdate={(id, status) => console.log('Status updated:', id, status)} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold">Health Score</p>
                <p>{trip.healthScore}/100</p>
              </div>
              <div>
                <p className="font-semibold">Status</p>
                <p>{trip.status}</p>
              </div>
              <div>
                <p className="font-semibold">Profit</p>
                <p>R{trip.analysis?.profitability?.netProfit ?? '—'}</p>
              </div>
              <div>
                <p className="font-semibold">Fuel Used</p>
                <p>{trip.analysis?.ifta?.fuelUsed ?? '—'} L</p>
              </div>
            </div>

            {trip.currentLocation && (
              <div className="mt-2 text-sm text-gray-600">
                📍 <strong>Current Location:</strong> {trip.currentLocation}
              </div>
            )}

            {trip.departureTime && (
              <div className="mt-1 text-sm text-gray-600">
                🕒 <strong>Departure Time:</strong> {trip.departureTime}
              </div>
            )}

            {trip.analysis?.remarks && (
              <div className="mt-2 text-sm text-gray-700">
                🧾 <strong>Remarks:</strong> {trip.analysis.remarks}
              </div>
            )}

            {trip.flagReason && (
              <div className="mt-3 text-sm text-red-600">
                🚨 <strong>Flagged:</strong> {trip.flagReason}
              </div>
            )}

            {trip.suggestedDriver_name && (
              <div className="mt-2 text-sm text-blue-600">
                🧠 <strong>Suggested Driver:</strong> {trip.suggestedDriver_name}
              </div>
            )}

            {trip.statusHistory && (
              <div className="mt-3 text-xs text-gray-600">
                <p className="font-semibold">Status History:</p>
                <ul className="list-disc ml-4">
                  {trip.statusHistory.map((entry, i) => (
                    <li key={i}>
                      {entry.status} @ {new Date(entry.timestamp).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ComplianceSummary trip={trip} />
            <TripProfitCard trip={trip} />
            <TripInsightsPanel trip={trip} />
            <AuditTrailViewer trip={trip} />
            <IncidentReporter tripId={trip.id} />
            <TripSignatureBlock driverName={trip.driver_name} />

            {/* ✅ Trip Map */}
            {trip.routeData?.path && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">🗺️ Route Overview</h4>
                <TripMap
                  origin={trip.origin}
                  destination={trip.destination}
                  routeData={trip.routeData}
                />
              </div>
            )}

            {/* ✅ Logsheet Renderer */}
            {trip.analysis?.dailyLogs?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">📋 Daily Logsheet</h4>
                <LogsheetCanvas logs={trip.analysis.dailyLogs} />
              </div>
            )}

            {/* ✅ Replay Toggle */}
            {trip.coordinates && (
              <>
                <button
                  onClick={() => setShowReplay(showReplay === trip.id ? null : trip.id)}
                  className="mt-4 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  {showReplay === trip.id ? '⏹ Stop Replay' : '▶️ Replay Trip'}
                </button>
                {showReplay === trip.id && <TripReplayWithStops trip={trip} />}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
