import React from 'react';
import { ShieldCheck, Wrench, TrendingUp, Plus } from 'lucide-react';
import InfoCard from './widgets/InfoCard';

const getNextService = (vehicle) => {
  const dueInMiles = vehicle.lastService + 10000 - vehicle.mileage;
  const event = dueInMiles <= 0 ? 'Service overdue' : 'Next service due';
  return { dueInMiles, event };
};

<button
  onClick={() => setSelectedTrip(trip)}
  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
>
  View Insights
</button>

{userRole === 'premium' && (
  <div className="bg-white p-6 rounded-xl shadow-md border text-center mb-8">
    <h2 className="text-2xl font-bold mb-4">Fleet Analytics</h2>
    <p className="text-gray-600">Coming soon: charts, fuel efficiency, and profitability reports.</p>
  </div>
)}

{userRole === 'premium' && (
  <div className="mt-8">
    <AnalyticsDashboard />
  </div>
)}

{userRole === 'premium' && (
  <div className="mt-8">
    <UploadDocuments user={user} />
  </div>
)}

const Dashboard = ({ tripCount, vehicle, setActiveView, userRole }) => {
  const nextService = getNextService(vehicle);

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-lg text-gray-500 mb-8">Monday, 22 September 2025 - Gqeberha, EC</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InfoCard title="HOS Status" value="8h 15m" subtitle="Driving time remaining" icon={<ShieldCheck className="text-green-500" />} />
        <InfoCard title="Next Service Due" value={`${nextService.dueInMiles} mi`} subtitle={nextService.event} icon={<Wrench className="text-yellow-600" />} />
        <InfoCard title="Trips This Month" value={tripCount} subtitle="View All Trips" onClick={() => setActiveView('my-trips')} isClickable={true} icon={<TrendingUp className="text-blue-500" />} />
      </div>

      {userRole === 'premium' && (
        <div className="bg-white p-6 rounded-xl shadow-md border text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Fleet Analytics</h2>
          <p className="text-gray-600">Coming soon: charts, fuel efficiency, and profitability reports.</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md border text-center">
        <h2 className="text-2xl font-bold mb-4">Ready for your next haul?</h2>
        <button onClick={() => setActiveView('planner')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto">
          <Plus /><span>Plan New Trip</span>
        </button>
      </div>
    </div>
    
  );
};

export default Dashboard;