import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DriverPerformance = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverTrips = async () => {
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

    fetchDriverTrips();
  }, []);

  const totalProfit = trips.reduce((sum, t) => sum + (t.analysis?.profitability?.netProfit ?? 0), 0);
  const avgHealth = Math.round(
    trips.reduce((sum, t) => sum + (t.healthScore ?? 0), 0) / (trips.length || 1)
  );

  const grouped = trips.reduce((acc, trip) => {
    const month = trip.date?.slice(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(trip.healthScore ?? 0);
    return acc;
  }, {});

  const sortedMonths = Object.keys(grouped).sort();
  const healthTrend = sortedMonths.map(month => {
    const scores = grouped[month];
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.round(avg);
  });

  const chartData = {
    labels: sortedMonths,
    datasets: [{
      label: 'Monthly Health Score',
      data: healthTrend,
      borderColor: 'rgb(59,130,246)',
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.3
    }]
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">🚚 Driver Performance</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-sm text-gray-500">Trips Completed</p>
              <p className="text-xl font-bold">{trips.length}</p>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className="text-xl font-bold">R{totalProfit.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-sm text-gray-500">Avg Health Score</p>
              <p className="text-xl font-bold">{avgHealth}/100</p>
            </div>
          </div>
          <div className="mt-6">
            <Line data={chartData} />
          </div>
        </>
      )}
    </div>
  );
};

export default DriverPerformance;