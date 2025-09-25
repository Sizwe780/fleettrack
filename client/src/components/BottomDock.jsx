import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const dockItems = [
  { path: '/maintenance', icon: '🛠️', label: 'Maint' },
  { path: '/offline', icon: '📴', label: 'Offline' },
  { path: '/rbac', icon: '🔐', label: 'RBAC' },
  { path: '/logsheet', icon: '📝', label: 'Logsheet' },
  { path: '/history', icon: '📜', label: 'History' },
  { path: '/notifications', icon: '🔔', label: 'Alerts' },
  { path: '/chatbot', icon: '🤖', label: 'Bot' },
  { path: '/billing', icon: '💳', label: 'Billing' },
  { path: '/compliance', icon: '🧾', label: 'Compliance' },
  { path: '/profile', icon: '👤', label: 'Profile' }
];

const moreItems = [
  { path: '/help', icon: '❓', label: 'Help' },
  { path: '/about', icon: '📘', label: 'About' },
  { path: '/contact', icon: '📬', label: 'Contact' },
  { path: '/privacy', icon: '🔐', label: 'Privacy' },
  { path: '/terms', icon: '📄', label: 'Terms' }
];

export default function BottomDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const handleLogout = async () => {
    await signOut(getAuth());
    navigate('/');
  };

  return (
    <div className="fixed bottom-4 right-0 z-50">
      <div className="w-[1152px] bg-gray-300 bg-opacity-50 text-navy h-16 flex items-center justify-between px-6 rounded-l-xl shadow-md">
        <div className="flex items-center gap-4">
          {dockItems.map(({ path, icon, label }) => (
            <Link key={path} to={path}
              className={`flex flex-col items-center px-2 py-1 text-xs font-medium rounded transition ${
                location.pathname === path ? 'bg-green-700 text-white' : 'hover:bg-gray-400'
              }`}>
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <button onClick={handleLogout}
            className="flex flex-col items-center px-2 py-1 text-xs font-medium bg-red-700 text-white rounded hover:bg-red-600">
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>

          <div className="relative">
            <button onClick={() => setShowMore(!showMore)}
              className="flex flex-col items-center px-2 py-1 text-xs font-medium bg-gray-400 rounded hover:bg-gray-500">
              <span className="text-xl">⋯</span>
              <span>More</span>
            </button>

            {showMore && (
              <div className="absolute bottom-20 right-0 bg-white text-navy border border-gray-300 rounded-lg shadow-lg p-4 z-50">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {moreItems.map(({ path, icon, label }) => (
                    <Link key={path} to={path} className="flex items-center gap-2 hover:text-green-700">
                      <span>{icon}</span><span>{label}</span>
                    </Link>
                  ))}
                  <button onClick={() => window.prompt('To install FleetTrack X, use your browser’s install option.')}
                    className="flex items-center gap-2 text-green-700 hover:text-green-800">
                    ⬇️ <span>Install</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}