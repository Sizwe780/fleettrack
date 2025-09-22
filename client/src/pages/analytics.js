import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
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

const Analytics = () => {
  const [monthlyScores, setMonthlyScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const healthRef = collection(db, 'fleet_health');
      const vehicles = await getDocs(healthRef);

      const allScores = [];

      for (const vehicle of vehicles.docs) {
        const subRef = collection(db, `fleet_health/${vehicle.id}/monthly_scores`);
        const subSnap = await getDocs(subRef);

        subSnap.forEach(doc => {
          const { score, timestamp } = doc.data();
          if (score && timestamp) {
            allScores.push({ vehicleId: vehicle.id, score, timestamp });
          }
        });
      }

      setMonthlyScores(allScores);
      setLoading(false);
    };

    fetchScores();
  }, []);

  // Group and average scores by month
  const grouped = monthlyScores.reduce((acc, entry) => {
    const month = entry.timestamp.slice(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry.score);
    return acc;
  }, {});

  const sortedMonths = Object.keys(grouped).sort();
  const averagedScores = sortedMonths.map(month => {
    const scores = grouped[month];
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.round(avg);
  });

  const chartData = {
    labels: sortedMonths,
    datasets: [{
      label: 'Average Fleet Health Score',
      data: averagedScores,
      borderColor: 'rgb(34,197,94)',
      backgroundColor: 'rgba(34,197,94,0.2)',
      tension: 0.3
    }]
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">📈 Fleet Health Trends</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <Line data={chartData} />
      )}
    </div>
  );
};

export default Analytics;