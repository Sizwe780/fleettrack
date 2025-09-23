import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register chart components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FuelTrendChart = ({ data }) => {
  // Ensure data is a valid array
  const safeData = Array.isArray(data) ? data : [];

  // Fallback if no data
  if (!safeData.length) {
    return (
      <div className="text-center text-gray-500 py-6">
        No fuel data available to display.
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: safeData.map(trip =>
      trip?.date ? new Date(trip.date).toLocaleDateString() : 'Unknown'
    ),
    datasets: [
      {
        label: 'Fuel Used (gallons)',
        data: safeData.map(trip => trip?.fuelUsed ?? 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Fuel Trend Over Time',
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Gallons' },
      },
      x: {
        title: { display: true, text: 'Date' },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default FuelTrendChart;