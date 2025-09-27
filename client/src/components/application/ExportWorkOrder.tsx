import React from 'react';
import { generatePDF } from '../utils/generatePDF';

export function ExportWorkOrder() {
  const handleExport = async () => {
    const workOrder = await fetch('/api/workOrder/latest').then(res => res.json());
    generatePDF({
      title: 'Work Order',
      certId: workOrder.certId,
      logoUrl: workOrder.logoUrl,
      remarks: workOrder.remarks,
      content: workOrder
    });
  };

  return (
    <div className="export-workorder">
      <button onClick={handleExport}>📤 Export Work Order</button>
    </div>
  );
}