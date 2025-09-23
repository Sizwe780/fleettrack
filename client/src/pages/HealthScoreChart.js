import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HealthScoreChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  const chartData = {
    labels: safeData.map(trip => trip.id ?? 'Trip'),
    datasets: [
      {
        label: 'Health Score',
        data: safeData.map(trip => trip.healthScore ?? 0),
        backgroundColor: safeData.map(trip => {
          const score = trip.healthScore ?? 0;
          return score >= 80
            ? 'rgba(75, 192, 192, 0.5)'
            : score >= 50
            ? 'rgba(255, 206, 86, 0.5)'
            : 'rgba(255, 99, 132, 0.5)';
        }),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Trip Health Scores',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return safeData.length > 0 ? (
    <Bar data={chartData} options={options} />
  ) : (
    <p className="text-sm text-gray-500">No health score data available.</p>
  );
};

export default HealthScoreChart;