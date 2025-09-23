import { Line } from 'react-chartjs-2';

export default function FleetHealthTrends({ data }) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [{
      label: 'Fleet Health Score',
      data: data.map(d => d.score),
      borderColor: 'green',
      fill: false
    }]
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-bold mb-2">📈 Fleet Health Trends</h3>
      <Line data={chartData} />
    </div>
  );
}