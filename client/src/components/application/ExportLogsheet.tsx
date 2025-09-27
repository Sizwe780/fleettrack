import React from 'react';
import { generatePDF } from '../utils/generatePDF';

export function ExportLogsheet({ uid }: { uid: string }) {
  const handleExport = async () => {
    const logsheetData = await fetch(`/api/logsheet?uid=${uid}`).then(res => res.json());
    generatePDF({
      title: 'Premium Logsheet',
      certId: logsheetData.certId,
      logoUrl: logsheetData.logoUrl,
      remarks: logsheetData.remarks,
      content: logsheetData
    });
  };

  return (
    <div className="export-logsheet">
      <button onClick={handleExport}>📤 Export Logsheet</button>
    </div>
  );
}