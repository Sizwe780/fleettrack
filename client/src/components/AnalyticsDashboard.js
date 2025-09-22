// src/components/AnalyticsDashboard.js
import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const snap = await getDocs(collection(db, 'trips'));
      const data = snap.docs.map(doc => doc.data());
      setTrips(data);
    };
    fetchTrips();
  }, []);

  const monthlyRevenue = {};
  const fuelEfficiency = [];

  trips.forEach(trip => {
    const month = new Date(trip.date).toLocaleString('default', { month: 'short' });
    const revenue = trip.analysis?.profitability?.revenue || 0;
    const fuelUsed = trip.analysis?.profitability?.fuelCost || 0;
    const miles = trip.analysis?.profitability?.distanceMiles || 0;

    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenue;
    if (fuelUsed && miles) fuelEfficiency.push(miles / fuelUsed);
  });

  const revenueData = {
    labels: Object.keys(monthlyRevenue),
    datasets: [{
      label: 'Monthly Revenue (R)',
      data: Object.values(monthlyRevenue),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderRadius: 6
    }]
  };

  const efficiencyData = {
    labels: fuelEfficiency.map((_, i) => `Trip ${i + 1}`),
    datasets: [{
      label: 'Fuel Efficiency (km/l)',
      data: fuelEfficiency,
      borderColor: 'rgba(75, 192, 192, 1)',
      fill: false,
      tension: 0.3
    }]
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold">Fleet Analytics</h2>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-2">Monthly Revenue</h3>
        <Bar data={revenueData} />
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-2">Fuel Efficiency</h3>
        <Line data={efficiencyData} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;