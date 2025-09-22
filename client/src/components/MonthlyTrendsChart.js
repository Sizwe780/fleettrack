import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const MonthlyTrendsChart = ({ trips }) => {
  const monthlyData = {};

  trips.forEach(trip => {
    const month = trip.date?.slice(0, 7); // "2025-09"
    if (!monthlyData[month]) monthlyData[month] = { profit: 0, fuel: 0 };
    monthlyData[month].profit += trip.analysis?.profitability?.netProfit ?? 0;
    monthlyData[month].fuel += trip.analysis?.ifta?.fuelUsed ?? 0;
  });

  const chartData = Object.entries(monthlyData).map(([month, values]) => ({
    month,
    ...values,
  }));

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">📈 Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="profit" stroke="#4ade80" name="Profit" />
          <Line type="monotone" dataKey="fuel" stroke="#60a5fa" name="Fuel Used" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendsChart;