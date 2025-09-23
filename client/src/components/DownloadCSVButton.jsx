import React from 'react';

export default function DownloadCSVButton({ trips, filename = 'FleetTrack_Export.csv' }) {
  const handleDownload = () => {
    if (!Array.isArray(trips) || trips.length === 0) {
      alert('No trips available to export.');
      return;
    }

    const headers = [
      'Trip ID',
      'Driver',
      'Date',
      'Origin',
      'Destination',
      'Departure Time',
      'Cycle Used',
      'Status',
      'Flag Reason',
      'Health Score',
      'Net Profit',
      'HOS Violation',
    ];

    const rows = trips.map((t) => {
      const logs = t.analysis?.dailyLogs ?? [];
      const hasHOSViolation = logs.some(
        (b) => b.type === 'driving' && parseFloat(b.durationHours ?? 0) > 4
      );

      return [
        t.id,
        `"${t.driver_name}"`,
        t.date,
        `"${t.origin}"`,
        `"${t.destination}"`,
        t.departureTime,
        t.cycleUsed,
        t.status,
        `"${t.flagReason ?? ''}"`,
        t.analysis?.healthScore ?? '',
        t.analysis?.profitability?.netProfit ?? '',
        hasHOSViolation ? 'Yes' : 'No',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
    >
      📥 Download CSV
    </button>
  );
}