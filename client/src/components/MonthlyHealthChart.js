import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

const MonthlyHealthChart = ({ data }) => {
  const lastMonth = data[data.length - 1];
  const prevMonth = data[data.length - 2];
  const delta = lastMonth && prevMonth
    ? lastMonth.averageScore - prevMonth.averageScore
    : null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">📊 Monthly Fleet Health Trends</h3>

      {delta !== null && (
        <p className={`text-sm mb-2 ${
          delta > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {delta > 0 ? '📈 Improving' : '📉 Declining'} by {Math.abs(delta)} points since last month
        </p>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="averageScore"
            stroke="#10b981"
            name="Health Score"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyHealthChart;