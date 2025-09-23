import React from 'react';
import { useNavigate } from 'react-router-dom';

const modules = [
  {
    title: '🧾 Compliance Archive',
    description: 'Searchable, exportable trip archive for regulators and auditors.',
    route: '/compliance-archive',
    badge: 'Audit-Ready'
  },
  {
    title: '📜 Audit Trail Viewer',
    description: 'Role-filtered logs with CSV export. Every action traceable.',
    route: '/audit',
    badge: 'Traceable'
  },
  {
    title: '🛠️ DevOps Console',
    description: 'Live patch toggles with audit logging and registry export.',
    route: '/devops',
    badge: 'Toggle-Driven'
  },
  {
    title: '🧭 Predictive Route Viewer',
    description: 'ETA, risk scoring, and optimized coordinates for smarter routing.',
    route: '/predictive-route',
    badge: 'AI-Powered'
  },
  {
    title: '📱 Offline Mode & PWA',
    description: 'Installable mobile app with offline fallback for rural fleets.',
    route: '/offline.html',
    badge: 'Installable'
  },
  {
    title: '🧪 Demo Dashboard',
    description: 'Curated trip with replay, logsheet, audit, and export.',
    route: '/demo-dashboard',
    badge: 'Investor-Ready'
  },
  {
    title: '📊 Fleet Analytics',
    description: 'Real-time KPIs, driver leaderboard, and health scoring.',
    route: '/fleet-analytics',
    badge: 'Insightful'
  }
];

export default function PitchDeckHighlights() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">🚀 FleetTrack Pitch Deck Highlights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, i) => (
          <div key={i} className="border rounded-xl p-4 shadow-sm bg-white space-y-3">
            <h3 className="text-lg font-semibold">{mod.title}</h3>
            <p className="text-sm text-gray-600">{mod.description}</p>
            <span className="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
              {mod.badge}
            </span>
            <button
              onClick={() => navigate(mod.route)}
              className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Live Demo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}