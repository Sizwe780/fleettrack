import React from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TripExport({ trips }) {
  const handleCSV = () => {
    const rows = trips.map(t => ({
      Driver: t.driver_name || '—',
      Origin: t.origin || '—',
      Destination: t.destination || '—',
      Status: t.status || 'pending',
      Departure: t.departureTime || '—',
      FuelRisk: t.analysis?.fuelRisk ?? 'N/A',
      FatigueRisk: t.analysis?.fatigueRisk ?? 'N/A',
      DelayRisk: t.analysis?.delayRisk ?? 'N/A',
      SLA_Breached: t.slaBreached ? 'Yes' : 'No',
      Flagged: t.status === 'critical' ? 'Yes' : 'No',
    }));

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fleettrack_trips_${new Date().toISOString()}.csv`;
    link.click();
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text('FleetTrack Trip Summary', 14, 20);
    doc.autoTable({
      startY: 30,
      head: [['Driver', 'Origin', 'Destination', 'Status', 'Fuel', 'Fatigue', 'Delay', 'SLA', 'Flagged']],
      body: trips.map(t => [
        t.driver_name || '—',
        t.origin || '—',
        t.destination || '—',
        t.status || 'pending',
        t.analysis?.fuelRisk ?? 'N/A',
        t.analysis?.fatigueRisk ?? 'N/A',
        t.analysis?.delayRisk ?? 'N/A',
        t.slaBreached ? 'Yes' : 'No',
        t.status === 'critical' ? 'Yes' : 'No',
      ]),
    });
    doc.save(`fleettrack_trips_${new Date().toISOString()}.pdf`);
  };

  return (
    <div className="mt-8 flex gap-4">
      <button
        onClick={handleCSV}
        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        📤 Export CSV
      </button>
      <button
        onClick={handlePDF}
        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
      >
        🧾 Export PDF
      </button>
    </div>
  );
}