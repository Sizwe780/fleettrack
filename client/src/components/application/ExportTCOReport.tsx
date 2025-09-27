import React from 'react';
import { generatePDF } from '../utils/generatePDF';

export function ExportTCOReport({ data }: { data: any }) {
  const handleExport = () => {
    generatePDF({
      title: 'TCO Report',
      certId: data.certId,
      logoUrl: data.logoUrl,
      remarks: data.remarks,
      content: data
    });
  };

  return (
    <div className="export-tco-report">
      <button onClick={handleExport}>📤 Export TCO Report</button>
    </div>
  );
}