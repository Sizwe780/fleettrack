import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function SidebarLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(getAuth());
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-6 space-y-6">
        <h1 className="text-xl font-bold text-indigo-700">FleetTrack X</h1>

        <nav className="space-y-2 text-sm">
          <Link to="/dashboard" className="block text-gray-700 hover:text-indigo-600">📊 Dashboard</Link>
          <Link to="/plan" className="block text-gray-700 hover:text-indigo-600">📝 Plan Trip</Link>
          <Link to="/leaderboard" className="block text-gray-700 hover:text-indigo-600">🏆 Leaderboard</Link>
          <Link to="/heatmap" className="block text-gray-700 hover:text-indigo-600">🔥 Heatmap</Link>
          <Link to="/cluster" className="block text-gray-700 hover:text-indigo-600">📍 Cluster Map</Link>
          <Link to="/maintenance" className="block text-gray-700 hover:text-indigo-600">🛠️ Maintenance</Link>
          <Link to="/offline" className="block text-gray-700 hover:text-indigo-600">📴 Offline Logger</Link>
          <Link to="/rbac" className="block text-gray-700 hover:text-indigo-600">🔐 RBAC Editor</Link>
          <Link to="/notifications" className="block text-gray-700 hover:text-indigo-600">🔔 Notifications</Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
        >
          Logout
        </button>

        <button
          onClick={() => window.prompt('To install FleetTrack X, use your browser’s install option.')}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm"
        >
          ⬇️ Install App
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}