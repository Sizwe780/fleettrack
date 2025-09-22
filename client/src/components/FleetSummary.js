const FleetSummary = ({ trips }) => {
    const totalProfit = trips.reduce((sum, t) => sum + (t.analysis?.profitability?.netProfit ?? 0), 0);
    const totalFuel = trips.reduce((sum, t) => sum + (t.analysis?.ifta?.fuelUsed ?? 0), 0);
    const totalDistance = trips.reduce((sum, t) => sum + (t.routeData?.distance ?? 0), 0);
  
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-100 p-4 rounded-md">
          <h3 className="font-bold">Total Profit</h3>
          <p className="text-xl">R{totalProfit.toFixed(2)}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-md">
          <h3 className="font-bold">Total Fuel Used</h3>
          <p className="text-xl">{totalFuel.toFixed(2)} L</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-md">
          <h3 className="font-bold">Total Distance</h3>
          <p className="text-xl">{totalDistance.toFixed(2)} km</p>
        </div>
      </div>
    );
  };
  
  export default FleetSummary;