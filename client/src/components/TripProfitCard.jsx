import React from 'react';

const TripProfitCard = ({ trip }) => {
  const profit = trip.analysis?.profitability ?? {};
  const {
    distanceMiles = '—',
    fuelUsed = '—',
    grossRevenue = '—',
    netProfit = '—',
    margin = '—',
  } = profit;

  return (
    <div className="mt-6 border rounded-xl p-4 bg-white shadow-md">
      <h2 className="text-lg font-bold mb-2">💰 Trip Profitability</h2>
      <ul className="text-sm space-y-1">
        <li>Distance: {distanceMiles} miles</li>
        <li>Fuel Used: {fuelUsed} L</li>
        <li>Gross Revenue: R{grossRevenue}</li>
        <li>Net Profit: R{netProfit}</li>
        <li>Profit Margin: {typeof margin === 'number' ? `${margin.toFixed(1)}%` : margin}</li>
      </ul>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs mt-3">
        <summary className="cursor-pointer font-semibold text-gray-700">📊 Profit Payload Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(profit, null, 2)}</pre>
      </details>
    </div>
  );
};

export default TripProfitCard;