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
  const chartData = {
    labels: data.map(trip => trip.id),
    datasets: [
      {
        label: 'Health Score',
        data: data.map(trip => trip.healthScore),
        backgroundColor: data.map(trip =>
          trip.healthScore >= 80 ? 'rgba(75, 192, 192, 0.5)' :
          trip.healthScore >= 50 ? 'rgba(255, 206, 86, 0.5)' :
          'rgba(255, 99, 132, 0.5)'
        ),
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
        text: 'Trip Health Scores',
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default HealthScoreChart;