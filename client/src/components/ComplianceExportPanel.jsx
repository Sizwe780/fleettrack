import React from 'react';

export default function ComplianceExportConsole() {
  const handleExport = async format => {
    const res = await fetch(`/api/export/compliance?format=${format}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance_export.${format}`;
    link.click();
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">🧾 Compliance Export</h2>
      <div className="space-x-4">
        <button onClick={() => handleExport('csv')} className="bg-blue-600 text-white px-4 py-2 rounded">Export CSV</button>
        <button onClick={() => handleExport('pdf')} className="bg-gray-700 text-white px-4 py-2 rounded">Export PDF</button>
        <button onClick={() => handleExport('json')} className="bg-indigo-600 text-white px-4 py-2 rounded">Export JSON</button>
      </div>
    </div>
  );
}