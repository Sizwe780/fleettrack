// --- MODULE IMPORTS ---
import React from 'react';
import { ShieldCheck, Wrench, TrendingUp, Plus } from 'lucide-react';
import TripCard from '../components/TripCard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

// --- UTILITY ---
const getNextService = (vehicle) => {
  const dueInMiles = vehicle.lastService + 10000 - vehicle.mileage;
  const event = dueInMiles <= 0 ? 'Service overdue' : 'Next service due';
  return { dueInMiles, event };
};

// --- COMPONENT ---
const Dashboard = ({
  tripCount,
  vehicle,
  setActiveView,
  userRole,
  user,
  trip,
  setSelectedTrip
}) => {
  const nextService = getNextService(vehicle);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-500">
          Monday, 22 September 2025 – Gqeberha, EC
        </p>
      </div>

      {/* View Insights Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (trip) {
              setSelectedTrip(trip);
              setActiveView('details');
            } else {
              setActiveView('my-trips'); // Fallback if no trip exists
            }
          }}
          className={`px-4 py-2 rounded transition ${trip ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          disabled={!trip}
        >
          View Insights
        </button>
      </div>

      {/* Premium Section */}
      {userRole === 'premium' && (
        <>
          <section className="bg-white p-6 rounded-xl shadow-md border text-center">
            <h2 className="text-2xl font-bold mb-4">Fleet Analytics</h2>
            <p className="text-gray-600">
              Coming soon: charts, fuel efficiency, and profitability reports.
            </p>
          </section>

          <div className="mt-8">
            <AnalyticsDashboard />
          </div>
        </>
      )}

      {/* Trip Planner CTA */}
      <section className="bg-white p-6 rounded-xl shadow-md border text-center">
        <h2 className="text-2xl font-bold mb-4">Ready for your next haul?</h2>
        <button
          onClick={() => setActiveView('planner')}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
        >
          <Plus />
          <span>Plan New Trip</span>
        </button>
      </section>
    </div>
  );
};

// --- EXPORT ---
export default Dashboard;