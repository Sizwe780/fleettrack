import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function SidebarLayout({ children }) {
  const location = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#f3e8ff] relative">
      {/* Sidebar flush left */}
      <aside
        className="w-72 bg-gray-300 text-navy rounded-xl shadow-lg flex-shrink-0 flex flex-col overflow-hidden"
        style={{ border: '2px solid rgba(45, 45, 45, 0.2)' }}
      >
        {/* Logo */}
        <div className="w-full h-24 flex items-center justify-center">
          <div className="bg-white rounded-full p-2 shadow-md">
            <img
              src="/icon-192.png"
              alt="FleetTrack Logo"
              className="h-17 w-18 object-contain"
            />
          </div>
        </div>

        {/* Dashboard link with extra spacing */}
        <div className="px-4 pt-8 mb-4">
          <SidebarLink path="/dashboard" label="📊 Dashboard" />
        </div>

        {/* Core Modules */}
        <div className="px-4 mb-2">
          <nav className="space-y-3">
            <SidebarLink path="/plan" label="📝 Plan Trip" />
            <SidebarLink path="/leaderboard" label="🏆 Leaderboard" />
            <SidebarLink path="/heatmap" label="🔥 Heatmap" />
            <SidebarLink path="/clustermap" label="📍 Cluster Map" />
          </nav>
        </div>

        {/* Intelligence Modules */}
        <div className="px-4 mt-4 mb-2 border-t pt-4">
          <nav className="space-y-3">
            <SidebarLink path="/ai-console" label="🧠 FleetAI Console" />
            <SidebarLink path="/telemetry" label="🛰️ Telemetry" />
          </nav>
        </div>

        {/* Admin Console */}
        <div className="px-4 mt-4 mb-2 border-t pt-4">
          <nav className="space-y-3">
            <SidebarLink path="/admin" label="🧑‍💼 Admin Console" />
          </nav>
        </div>

        {/* Footer */}
        <div className="space-y-4 px-6 pb-6 mt-8">
          <div className="flex items-center justify-between px-4 py-2 rounded shadow-sm">
            <span className="text-sm font-medium text-navy">🔔 Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="text-xs text-gray-700 text-center mt-2 leading-tight">
            🌍 Nelson Mandela Bay<br />
            <span className="text-green-700 font-semibold">Azania: The Crown Jewel</span>
          </div>
        </div>
      </aside>

      {/* Main Content flush with sidebar */}
      <main className="flex-1 p-8 pb-20">{children}</main>
    </div>
  );
}

function SidebarLink({ path, label }) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={`block w-full text-center px-4 py-3 rounded-lg shadow-sm transition ${
        isActive
          ? 'bg-green-100 text-green-700 font-semibold'
          : 'bg-white text-navy hover:bg-gray-100 hover:text-green-700'
      }`}
    >
      {label}
    </Link>
  );
}