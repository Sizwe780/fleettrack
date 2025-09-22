import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const DriverHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minProfit, setMinProfit] = useState(0);

  useEffect(() => {
    const fetchTrips = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const snapshot = await getDocs(collection(db, 'trips'));
      const driverTrips = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(t => t.driver_uid === user.uid && t.status === 'completed');

      setTrips(driverTrips);
      setLoading(false);
    };

    fetchTrips();
  }, []);

  const filtered = trips
    .filter(t => t.origin?.toLowerCase().includes(search.toLowerCase()) || t.destination?.toLowerCase().includes(search.toLowerCase()))
    .filter(t => (t.analysis?.profitability?.netProfit ?? 0) >= minProfit);

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">🧾 Trip History</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search origin/destination"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-md"
        />
        <input
          type="number"
          placeholder="Min Profit (R)"
          value={minProfit}
          onChange={(e) => setMinProfit(Number(e.target.value))}
          className="p-2 border rounded-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(trip => (
            <div key={trip.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{trip.origin} → {trip.destination}</h3>
                <span className="text-sm text-gray-500">{new Date(trip.date).toLocaleDateString('en-ZA')}</span>
              </div>
              <p className="text-sm text-gray-600">Profit: R{trip.analysis?.profitability?.netProfit?.toFixed(2) ?? '0.00'}</p>
              <p className="text-sm text-gray-600">Fuel Used: {trip.analysis?.ifta?.fuelUsed ?? 0} L</p>
              <p className="text-sm text-gray-600">Health Score: {trip.healthScore ?? 'N/A'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No trips match your filters.</p>
      )}
    </div>
  );
};

export default DriverHistory;