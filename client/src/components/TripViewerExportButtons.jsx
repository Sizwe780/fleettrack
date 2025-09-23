export default function TripViewerExportButtons({ trip, tripId }) {
    const exportJSON = () => {
      const blob = new Blob([JSON.stringify(trip)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tripId}-trip.json`;
      link.click();
    };
  
    const exportCSV = () => {
      const rows = [
        ['Driver', trip.driver_name],
        ['Origin', trip.origin],
        ['Destination', trip.destination],
        ['Date', trip.date],
        ['Health Score', trip.healthScore],
        ['Status', trip.status]
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tripId}-trip.csv`;
      link.click();
    };
  
    return (
      <div className="flex gap-4 mt-4">
        <button onClick={exportJSON} className="px-4 py-2 bg-gray-700 text-white rounded">📤 Export JSON</button>
        <button onClick={exportCSV} className="px-4 py-2 bg-gray-700 text-white rounded">📄 Export CSV</button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded">🖨️ Print Logsheet</button>
      </div>
    );
  }