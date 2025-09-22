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
  const chartData = {
    labels: data.map(trip => new Date(trip.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Fuel Used (gallons)',
        data: data.map(trip => trip.fuelUsed),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Fuel Trend Over Time',
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default FuelTrendChart;