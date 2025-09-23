import React from 'react';

const TripProfitCard = ({ trip }) => {
  const profit = trip.analysis?.profitability ?? {};
  return (
    <div className="mt-6 border rounded-xl p-4 bg-white shadow-md">
      <h2 className="text-lg font-bold mb-2">💰 Trip Profitability</h2>
      <ul className="text-sm space-y-1">
        <li>Distance: {profit.distanceMiles} miles</li>
        <li>Fuel Used: {profit.fuelUsed} L</li>
        <li>Gross Revenue: R{profit.grossRevenue}</li>
        <li>Net Profit: R{profit.netProfit}</li>
        <li>Profit Margin: {profit.margin}%</li>
      </ul>
    </div>
  );
};

export default TripProfitCard;