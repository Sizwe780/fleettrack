import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

const SidebarLayout = ({ children, role, title = 'Dashboard' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(getAuth());
    router.push('/login');
  };

  const navLinks = [
    { label: 'Dashboard', href: '/' },
    ...(role === 'driver'
      ? [
          { label: 'Driver Performance', href: '/driverPerformance' },
          { label: 'Trip History', href: '/driverHistory' },
          { label: 'Driver Settings', href: '/driverSettings' },
          { label: 'Upload Proof', href: '/driverUpload' },
          { label: 'Driver Alerts', href: '/driverAlerts' },
          { label: 'Driver Leaderboard', href: '/driverLeaderboard' },
          { label: 'Driver Chat', href: '/driverChat' }
        ]
      : []),
    ...(role === 'admin' || role === 'analyst'
      ? [
          { label: 'Analytics', href: '/analytics' },
          { label: 'Manage Trips', href: '/manageTrips' },
          { label: 'Assign Trip', href: '/assignTrip' },
          { label: 'Audit Logs', href: '/auditLogs' },
          { label: 'Fleet Risk', href: '/fleetRisk' },
          { label: 'Predictive Maintenance', href: '/predictiveMaintenance' }
        ]
      : [])
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r transition-all duration-300`}>
        <div className="p-4 font-bold text-lg text-blue-600">FleetTrack</div>
        <nav className="space-y-2 px-2">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100"
            >
              {collapsed ? link.label.charAt(0) : link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm text-gray-500 capitalize">Role: {role}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="px-2 py-1 text-sm bg-gray-200 rounded-md"
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {role?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;