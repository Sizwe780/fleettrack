import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarLayout({ logo, title, navItems, footer, children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🧭 Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 shadow-xl p-6 flex flex-col">
        <header className="flex items-center gap-3 mb-6">
          <img src={logo} alt="FleetTrack ∞" className="h-8 w-8" />
          <div>
            <h2 className="text-xl font-bold text-indigo-700 tracking-tight">{title}</h2>
            <span className="text-xs text-gray-500 italic">Operator Console</span>
          </div>
        </header>

        <nav className="flex-1 space-y-4">
          {navItems.map(({ label, route }) => (
            <NavLink
              key={route}
              to={route}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                }`
              }
              aria-label={`Navigate to ${label}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <footer className="mt-10">{footer}</footer>
      </aside>

      {/* 🧠 Main View */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}