// client/src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-blue-600">FleetTrack</div>
      <div className="flex space-x-6">
        <Link
          to="/"
          className={`text-sm font-medium ${
            isActive('/') ? 'text-blue-600 underline' : 'text-gray-700 hover:text-blue-500'
          }`}
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className={`text-sm font-medium ${
            isActive('/dashboard') ? 'text-blue-600 underline' : 'text-gray-700 hover:text-blue-500'
          }`}
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;