const TripComparisonTable = ({ trips }) => {
    const metrics = [
      { label: 'Driver', key: 'driver_name' },
      { label: 'Origin → Destination', key: t => `${t.origin} → ${t.destination}` },
      { label: 'Date', key: 'date' },
      { label: 'Profit (R)', key: t => t.analysis?.profitability?.netProfit ?? 0 },
      { label: 'Fuel Used (L)', key: t => t.analysis?.ifta?.fuelUsed ?? 0 },
      { label: 'Distance (km)', key: t => t.routeData?.distance ?? 0 },
      { label: 'Cycle Time (hrs)', key: 'cycleUsed' },
      { label: 'Remarks', key: t => t.analysis?.remarks ?? '—' },
    ];
  
    return (
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Metric</th>
              {trips.map(trip => (
                <th key={trip.id} className="p-2 border">
                  {trip.driver_name} ({trip.date})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map(({ label, key }) => (
              <tr key={label}>
                <td className="p-2 border font-semibold">{label}</td>
                {trips.map(trip => (
                  <td key={trip.id + label} className="p-2 border">
                    {typeof key === 'function' ? key(trip) : trip[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default TripComparisonTable;