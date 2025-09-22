import React from 'react';

const ExportButton = ({ trips }) => {
  const handleExport = () => {
    const headers = ['Driver', 'Origin', 'Destination', 'Date', 'Profit', 'Fuel Used', 'Distance'];
    const rows = trips.map(t => [
      t.driver_name ?? 'Unknown',
      t.origin ?? '',
      t.destination ?? '',
      new Date(t.date).toLocaleDateString('en-ZA'),
      t.analysis?.profitability?.netProfit ?? 0,
      t.analysis?.ifta?.fuelUsed ?? 0,
      t.analysis?.profitability?.distanceMiles ?? 0
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(String).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'fleettrack_trips.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
    >
      Export Trips to CSV
    </button>
  );
};

export default ExportButton;