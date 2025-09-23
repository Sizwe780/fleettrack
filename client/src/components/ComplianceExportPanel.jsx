export default function ComplianceExportPanel({ trips }) {
    const exportCSV = () => {
      const headers = ['Trip ID', 'Driver', 'Origin', 'Destination', 'Date', 'Health Score', 'Status'];
      const rows = trips.map(t => [
        t.tripId,
        t.driver_name,
        t.origin,
        t.destination,
        t.date,
        t.healthScore,
        t.status
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FleetTrack_Compliance_Archive.csv`;
      link.click();
    };
  
    return (
      <div className="flex gap-4 mb-6">
        <button onClick={exportCSV} className="px-4 py-2 bg-gray-800 text-white rounded">📄 Export CSV</button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded">🖨️ Print All Logsheets</button>
      </div>
    );
  }