import React, { useState, useEffect } from 'react';
import TripDashboard from '../components/TripDashboard'; // adjust path if needed
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [driverFilter, setDriverFilter] = useState('');
  const [minProfit, setMinProfit] = useState(0);
  const [maxFuel, setMaxFuel] = useState(9999);
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchTrips = async () => {
      const snapshot = await getDocs(collection(db, 'trips'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(data);
    };
    fetchTrips();
  }, []);

  const filteredTrips = trips
    .filter(t => t.driver_name?.toLowerCase().includes(driverFilter.toLowerCase()))
    .filter(t => (t.analysis?.profitability?.netProfit ?? 0) >= minProfit)
    .filter(t => (t.analysis?.ifta?.fuelUsed ?? 0) <= maxFuel)
    .sort((a, b) => {
      if (sortBy === 'profit') {
        return (b.analysis?.profitability?.netProfit ?? 0) - (a.analysis?.profitability?.netProfit ?? 0);
      }
      if (sortBy === 'fuel') {
        return (a.analysis?.ifta?.fuelUsed ?? 0) - (b.analysis?.ifta?.fuelUsed ?? 0);
      }
      return new Date(b.date) - new Date(a.date);
    });

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Driver name"
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
          className="p-2 border rounded-md"
        />
        <input
          type="number"
          placeholder="Min Profit (R)"
          value={minProfit}
          onChange={(e) => setMinProfit(Number(e.target.value))}
          className="p-2 border rounded-md"
        />
        <input
          type="number"
          placeholder="Max Fuel (L)"
          value={maxFuel}
          onChange={(e) => setMaxFuel(Number(e.target.value))}
          className="p-2 border rounded-md"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="date">Sort by Date</option>
          <option value="profit">Sort by Profit</option>
          <option value="fuel">Sort by Fuel Used</option>
        </select>
      </div>

      {/* Trip Dashboards */}
      {filteredTrips.length > 0 ? (
        filteredTrips.map(trip => (
          <TripDashboard key={trip.id} trip={trip} />
        ))
      ) : (
        <p className="text-gray-500">No trips match the current filters.</p>
      )}
    </div>
  );
};

export default Dashboard;