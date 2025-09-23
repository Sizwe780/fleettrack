export const buildExportBundle = (trip) => {
    return `
      FleetTrack Trip Export — ${trip.origin} → ${trip.destination}
      Driver: ${trip.driver_name}
      Date: ${trip.date}
      Health Score: ${trip.healthScore}/100
      Profit: R${trip.analysis?.profitability?.netProfit}
      Violations: ${trip.analysis?.violations?.join(', ') || 'None'}
      Remarks: ${trip.analysis?.remarks || '—'}
      Signature: ____________________________
    `;
  };