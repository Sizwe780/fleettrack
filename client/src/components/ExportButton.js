import React from 'react';

export default function ExportButton({ targetId, filename = 'FleetTrack_Export.pdf' }) {
  const handleExport = () => {
    const target = document.getElementById(targetId);
    if (!target) {
      alert('Export target not found.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocked. Please allow popups to export.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; }
            h1, h2, h3 { margin-top: 2rem; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body>${target.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
    >
      📤 Export to PDF
    </button>
  );
}