const DriverLeaderboard = ({ trips }) => {
    const driverStats = {};
  
    trips.forEach(trip => {
      const name = trip.driver_name;
      const profit = trip.analysis?.profitability?.netProfit ?? 0;
      if (!driverStats[name]) driverStats[name] = 0;
      driverStats[name] += profit;
    });
  
    const sorted = Object.entries(driverStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  
    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">🏆 Top Drivers by Profit</h3>
        <ul className="list-disc list-inside">
          {sorted.map(([name, profit]) => (
            <li key={name}>
              {name}: R{profit.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default DriverLeaderboard;