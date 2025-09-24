import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function GovernmentExportModule({ trips, contractId }) {
  const handleExport = () => {
    const doc = new jsPDF();
    doc.text('FleetTrack Government Export', 14, 20);
    if (contractId) doc.text(`Contract ID: ${contractId}`, 14, 30);

    doc.autoTable({
      startY: 40,
      head: [['Trip ID', 'Driver', 'Vehicle', 'Origin', 'Destination', 'Departure', 'Status']],
      body: trips.map(t => [
        t.id || 'Unknown',
        t.driver_name || 'Unknown',
        t.vehicle_id || 'Unknown',
        t.origin || '—',
        t.destination || '—',
        t.departureTime || '—',
        t.status || '—',
      ]),
    });

    doc.save(`fleettrack_export_${contractId || 'general'}.pdf`);
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🏛️ Government Export</h2>
      <p className="text-sm text-gray-700 mb-2">
        Format trip logs for public-sector compliance, tender submissions, and SLA traceability.
      </p>
      <button
        onClick={handleExport}
        className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
      >
        Export PDF
      </button>
    </div>
  );
}