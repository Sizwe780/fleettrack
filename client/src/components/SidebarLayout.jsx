import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function SidebarLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    await signOut(getAuth());
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/plan', label: '📝 Plan Trip' },
    { path: '/leaderboard', label: '🏆 Leaderboard' },
    { path: '/heatmap', label: '🔥 Heatmap' },
    { path: '/clustermap', label: '📍 Cluster Map' },
    { path: '/maintenance', label: '🛠️ Maintenance' },
    { path: '/offline', label: '📴 Offline Logger' },
    { path: '/rbac', label: '🔐 RBAC Editor' },
    { path: '/history', label: '📜 Past Trips' },
    { path: '/logsheet', label: '📝 Print LogSheet' },
    { path: '/notifications', label: '🔔 Alerts' },
    { path: '/chatbot', label: '🤖 Assistant' },
    { path: '/ai-console', label: '🧠 FleetAI Console' },
    { path: '/telemetry', label: '🛰️ Telemetry' },
    { path: '/admin', label: '🧑‍💼 Admin Console' },
    { path: '/billing', label: '💳 Billing' },
    { path: '/mobile-sync', label: '📱 Mobile Sync' },
    { path: '/compliance', label: '🧾 Compliance' },
    { path: '/profile', label: '👤 Profile' },
    { path: '/subscription', label: '📦 Subscription' },
    { path: '/help', label: '❓ Help' },
    { path: '/about', label: '📘 About' },
    { path: '/contact', label: '📬 Contact' },
    { path: '/privacy', label: '🔐 Privacy' },
    { path: '/terms', label: '📄 Terms' }
  ];

  return (
    <div className="flex min-h-screen bg-[#f3e8ff]">
      <aside
        className="w-72 bg-gray-300 text-navy rounded-xl shadow-lg m-4 flex flex-col overflow-hidden"
        style={{ border: '2px solid rgba(45, 45, 45, 0.2)' }}
      >
        {/* Logo icon with white badge and shadow */}
        <div className="w-full h-24 flex items-center justify-center">
          <div className="bg-white rounded-full p-2 shadow-md">
            <img
              src="/icon-192.png"
              alt="FleetTrack Logo"
              className="h-17 w-18 object-contain"
            />
          </div>
        </div>

        {/* Centered nav items in boxed layout */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
          <nav className="space-y-4 w-[90%]">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`block w-full text-center px-4 py-3 rounded-lg shadow-sm transition ${
                  location.pathname === path
                    ? 'bg-green-100 text-green-700 font-semibold'
                    : 'bg-white text-navy hover:bg-gray-100 hover:text-green-700'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer controls with clean spacing */}
        <div className="space-y-4 px-6 pb-6 mt-8">
          {/* Notifications toggle */}
          <div className="flex items-center justify-between bg-white px-4 py-2 rounded shadow-sm">
            <span className="text-sm font-medium text-navy">🔔 Notifications</span>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
              className="h-5 w-5"
            />
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
          >
            Logout
          </button>

          <button
            onClick={() =>
              window.prompt('To install FleetTrack X, use your browser’s install option.')
            }
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
          >
            ⬇️ Install App
          </button>

          <div className="text-xs text-gray-700 text-center mt-2 leading-tight">
            🌍 Nelson Mandela Bay<br />
            <span className="text-green-700 font-semibold">v9.5+ cockpit</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}