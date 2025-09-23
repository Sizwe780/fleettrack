export function buildExportBundle(trip) {
    if (!trip || !trip.id) return '⚠️ No trip data available.';
  
    const lines = [];
  
    // 🧾 Header
    lines.push(`FleetTrack Trip Export`);
    lines.push(`Trip ID: ${trip.id}`);
    lines.push(`Driver: ${trip.driver_name}`);
    lines.push(`Date: ${trip.date}`);
    lines.push(`Origin: ${trip.origin}`);
    lines.push(`Destination: ${trip.destination}`);
    lines.push(`Departure Time: ${trip.departureTime}`);
    lines.push(`Cycle Used: ${trip.cycleUsed} hrs`);
    lines.push(`Status: ${trip.status}`);
    if (trip.flagReason) lines.push(`⚠️ Flag: ${trip.flagReason}`);
    lines.push('');
  
    // 💰 Profitability
    const profit = trip.analysis?.profitability ?? {};
    lines.push(`💰 Profitability`);
    lines.push(`Distance: ${profit.distanceMiles ?? '—'} miles`);
    lines.push(`Fuel Used: ${profit.fuelUsed ?? '—'} L`);
    lines.push(`Gross Revenue: R${profit.grossRevenue ?? '—'}`);
    lines.push(`Net Profit: R${profit.netProfit ?? '—'}`);
    lines.push(`Profit Margin: ${profit.margin ?? '—'}%`);
    lines.push('');
  
    // 📋 Daily Logs
    const logs = trip.analysis?.dailyLogs ?? [];
    lines.push(`📋 Daily Logsheet`);
    if (logs.length === 0) {
      lines.push(`No logs available.`);
    } else {
      logs.forEach((block, i) => {
        lines.push(
          `• ${block.date} | ${block.type.toUpperCase()} | ${block.start}–${block.end} | ${block.durationHours ?? '—'}h`
        );
      });
    }
    lines.push('');
  
    // 🧠 Insights
    const insights = Array.isArray(trip.analysis?.insights)
      ? trip.analysis.insights
      : typeof trip.analysis?.insights === 'string'
      ? [trip.analysis.insights]
      : [];
    lines.push(`🧠 Strategic Insights`);
    if (insights.length === 0) {
      lines.push(`No insights available.`);
    } else {
      insights.forEach((i) => lines.push(`• ${i}`));
    }
    lines.push('');
  
    // 📜 Audit Trail
    const history = trip.statusHistory ?? [];
    lines.push(`📜 Audit Trail`);
    if (history.length === 0) {
      lines.push(`No status history available.`);
    } else {
      history.forEach((h, i) => {
        const time = new Date(h.timestamp).toLocaleString();
        lines.push(`• ${time} | ${h.status} | ${h.actor}`);
      });
    }
    lines.push('');
  
    // ✍️ Signature Block
    lines.push(`Driver: ${trip.driver_name}`);
    lines.push(`Signature: ____________________________`);
    lines.push(`Date: _________________________________`);
  
    return lines.join('\n');
  }