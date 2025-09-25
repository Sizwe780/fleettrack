import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

const TripExportEngine = ({ trip }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  const exportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a3');
    doc.setFont('Courier');
    doc.setFontSize(14);
    doc.text(`Trip Logsheet — ${trip.tripId}`, 20, 20);

    doc.autoTable({
      startY: 30,
      head: [['Field', 'Value']],
      body: [
        ['Origin', trip.origin],
        ['Destination', trip.destination],
        ['Driver', trip.driverName],
        ['Vehicle', trip.vehicleId],
        ['Start Time', formatDate(trip.startTime)],
        ['End Time', formatDate(trip.endTime)],
        ['Duration', `${trip.duration?.toFixed(2)} hrs`],
        ['Status', trip.status],
        ['Audit Hash', trip.audit_hash],
        ['Exported At', formatDate(trip.exportedAt)],
      ],
    });

    doc.text(`Exported: ${formatDate(trip.exportedAt)} | Hash: ${trip.audit_hash}`, 20, doc.lastAutoTable.finalY + 10);
    doc.save(`FleetTrack_Trip_${trip.tripId}.pdf`);
  };

  const exportCSV = () => {
    const rows = [
      ['Trip ID', trip.tripId],
      ['Origin', trip.origin],
      ['Destination', trip.destination],
      ['Driver', trip.driverName],
      ['Vehicle', trip.vehicleId],
      ['Start Time', formatDate(trip.startTime)],
      ['End Time', formatDate(trip.endTime)],
      ['Duration', `${trip.duration?.toFixed(2)} hrs`],
      ['Status', trip.status],
      ['Audit Hash', trip.audit_hash],
      ['Exported At', formatDate(trip.exportedAt)],
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `FleetTrack_Trip_${trip.tripId}.csv`);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(trip, null, 2)], { type: 'application/json' });
    saveAs(blob, `FleetTrack_Trip_${trip.tripId}.json`);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <section className="logsheet-section">
      <h2>Export Options</h2>
      <button onClick={exportPDF}>📄 Export PDF</button>
      <button onClick={exportCSV}>📊 Export CSV</button>
      <button onClick={exportJSON}>🧾 Export JSON</button>
      <button onClick={triggerPrint}>🖨️ Print Logsheet</button>
    </section>
  );
};

export default TripExportEngine;