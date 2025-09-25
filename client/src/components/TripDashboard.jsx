import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

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
import TripExportPreview from './TripExportPreview';
import TripExportSignatureBlock from './TripExportSignatureBlock';

export default function TripDashboard({ userId }) {
  const [trips, setTrips] = useState([]);
  const [showReplayId, setShowReplayId] = useState(null);

  useEffect(() => {
    const path = `apps/fleet-track-app/trips`;
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const entries = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(t => t.driver_uid === userId);

        const sorted = entries.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() ?? new Date(a.date ?? 0);
          const bTime = b.createdAt?.toDate?.() ?? new Date(b.date ?? 0);
          return bTime - aTime;
        });

        setTrips(sorted);
      },
      (error) => {
        console.error('Snapshot error:', error.message);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const avgHealthScore = useMemo(() => Math.round(
    trips.reduce((sum, t) => sum + (t.analysis?.healthScore ?? t.healthScore ?? 0), 0) / (trips.length || 1)
  ), [trips]);

  const avgProfit = useMemo(() => Math.round(
    trips.reduce((sum, t) => sum + (t.analysis?.profitability?.netProfit ?? 0), 0) / (trips.length || 1)
  ), [trips]);

  const flaggedTrips = useMemo(() => trips.filter(t => t.status === 'critical'), [trips]);

  const toggleReplay = (tripId) => {
    setShowReplayId(prev => (prev === tripId ? null : tripId));
  };

  return (
    <main role="main" className="max-w-7xl mx-auto mt-10 space-y-10 px-6 bg-purple-100 rounded-xl p-8 shadow-inner">
      {/* 🧭 FleetTrack Control Panel */}
      <div className="bg-white border border-green-100 rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-navy mb-4">FleetTrack Control Panel</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-6 text-sm">
          {[
            'Dashboard', 'Plan Trip', 'Trip Map', 'Trip History', 'Leaderboard',
            'Heatmap', 'Fleet Analytics', 'Cluster Map', 'Maintenance', 'Offline Logger',
            'RBAC Editor', 'Compliance', 'Notifications', 'Fleet Assistant', 'Billing',
            'Profile', 'Admin Console', 'Telemetry', 'Mobile Sync', 'Centurion Grid'
          ].map(label => (
            <ControlLink key={label} label={label} to={`/${label.toLowerCase().replace(/ /g, '-')}`} />
          ))}
        </div>
      </div>

      {/* ⚙️ FleetTrack Core Engines */}
      <div className="bg-white border border-gray-300 rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-navy mb-4">FleetTrack Core Engines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EngineCard name="🧠 QVector Predictive Engine" status="Optimal" metric="Accuracy: 98.7%" />
          <EngineCard name="🌐 Centurion Grid Mesh" status="Stable" metric="Node Sync: 99.2%" />
          <EngineCard name="🛡️ Audit Overlay System" status="Active" metric="Compliance Coverage: 100%" />
        </div>
      </div>

      {/* 📊 Trip Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-8">
        <StatCard label="Avg Fleet Score" value={`${avgHealthScore}/100`} bg="green-50" />
        <StatCard label="Trips This Month" value={trips.length} bg="blue-50" />
        <StatCard label="Flagged Trips" value={flaggedTrips.length} bg="yellow-50" />
        <StatCard label="Avg Profit" value={`R${avgProfit}`} bg="purple-50" />
      </div>

      {/* 🚚 Trip Cards */}
      {trips.length === 0 ? (
        <p className="text-sm text-gray-500 mt-4">No trips found. Submit one to get started.</p>
      ) : (
        trips.map(trip => (
          <TripCard
            key={trip.id}
            trip={trip}
            showReplay={showReplayId === trip.id}
            onToggleReplay={() => toggleReplay(trip.id)}
          />
        ))
      )}
    </main>
  );
}

// 🧩 Modular Components
const StatCard = ({ label, value, bg }) => (
  <div className={`bg-${bg} p-4 rounded shadow-sm`}>
    <p className="font-semibold text-navy">{label}</p>
    <p>{value}</p>
  </div>
);

const ControlLink = ({ label, to }) => (
  <Link
    to={to}
    className="block bg-purple-200 bg-opacity-75 hover:bg-purple-300 text-navy font-medium px-4 py-3 rounded text-center shadow-sm transition duration-200 ease-in-out"
    aria-label={`Go to ${label}`}
  >
    {label}
  </Link>
);

const EngineCard = ({ name, status, metric }) => (
  <div className="bg-gray-50 p-4 rounded shadow-sm">
    <p className="font-semibold text-navy text-sm mb-1">{name}</p>
    <p className="text-xs text-gray-600 mb-2">Status: <span className="font-bold text-green-600">{status}</span></p>
    <p className="text-xs text-gray-600 mb-4">{metric}</p>
    <Speedometer />
  </div>
);

const Speedometer = () => (
  <div className="relative w-full h-24 bg-gradient-to-r from-green-200 to-green-500 rounded-full overflow-hidden">
    <div className="absolute left-0 top-0 h-full bg-green-700 animate-pulse rounded-full" style={{ width: '85%' }} />
    <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
      Optimal Performance
    </p>
  </div>
);

const TripStat = ({ label, value }) => (
  <div>
    <p className="font-semibold text-navy">{label}</p>
    <p>{value}</p>
  </div>
);

const FlagNotice = ({ reason }) => (
  <div className="mt-3 text-sm text-red-600">
    🚨 <strong>Flagged:</strong> {reason}
  </div>
);

const SuggestedDriver = ({ name }) => (
  <div className="mt-2 text-sm text-blue-600">
    🧠 <strong>Suggested Driver:</strong> {name}
  </div>
);

const Section = ({ title, children }) => (
  <div className="mt-6">
    <h4 className="text-sm font-semibold mb-2">{title}</h4>
    {children}
  </div>
);

// ✅ Continue with TripCard component exactly as in your last working version
const TripCard = ({ trip, showReplay, onToggleReplay }) => (
    <section
      id={`trip-${trip.id}`}
      role="region"
      aria-labelledby={`trip-title-${trip.id}`}
      className={`p-6 rounded-xl shadow-md border ${
        trip.status === 'critical' ? 'border-red-500 bg-red-50' : 'bg-white'
      }`}
    >
      <h3 id={`trip-title-${trip.id}`} className="text-lg font-semibold mb-2">
        {trip.origin} → {trip.destination}
      </h3>
  
      <TripStatusBadge status={trip.status} />
      <TripStatusManager trip={trip} onStatusUpdate={(id, status) => console.log('Status updated:', id, status)} />
  
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
        <TripStat label="Health Score" value={`${trip.analysis?.healthScore ?? trip.healthScore}/100`} />
        <TripStat label="Status" value={trip.status} />
        <TripStat label="Profit" value={`R${trip.analysis?.profitability?.netProfit ?? '—'}`} />
        <TripStat label="Fuel Used" value={`${trip.analysis?.ifta?.fuelUsed ?? '—'} L`} />
      </div>
  
      {trip.flagReason && <FlagNotice reason={trip.flagReason} />}
      {trip.suggestedDriver_name && <SuggestedDriver name={trip.suggestedDriver_name} />}
  
      {trip.statusHistory && (
        <div className="mt-3 text-xs text-gray-600">
          <p className="font-semibold">Status History:</p>
          <ul className="list-disc ml-4">
            {trip.statusHistory.map((entry, i) => (
              <li key={i}>{entry.status} @ {new Date(entry.timestamp).toLocaleString()}</li>
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
  
      {trip.routeData?.path && (
        <Section title="🗺️ Route Overview">
          <TripMap origin={trip.origin} destination={trip.destination} routeData={trip.routeData} />
        </Section>
      )}
  
      {trip.analysis?.dailyLogs?.length > 0 && (
        <Section title="📋 Daily Logsheet">
          <LogsheetCanvas logs={trip.analysis.dailyLogs} />
        </Section>
      )}
  
      {trip.coordinates && (
        <>
          <button
            onClick={onToggleReplay}
            aria-label={showReplay ? 'Stop trip replay' : 'Start trip replay'}
            aria-pressed={showReplay}
            className={`mt-4 px-3 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              showReplay ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {showReplay ? '⏹ Stop Replay' : '▶️ Replay Trip'}
          </button>
          {showReplay && <TripReplayWithStops trip={trip} />}
        </>
      )}
  
      <TripExportPreview trip={trip} />
      <TripExportSignatureBlock trip={trip} />
  
      <details className="mt-6 bg-gray-50 p-3 rounded text-xs">
        <summary className="cursor-pointer font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          🔍 Trip Payload Debug
        </summary>
        <pre className="overflow-x-auto mt-2 max-w-full whitespace-pre-wrap break-words">
          {JSON.stringify(trip, null, 2)}
        </pre>
      </details>
    </section>
  );