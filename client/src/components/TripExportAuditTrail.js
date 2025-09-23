export const buildAuditTrail = (trip) => {
    const incidents = trip.incidents ?? [];
    const statusHistory = trip.statusHistory ?? [];
  
    return `
      Audit Trail:
      ${statusHistory.map(s => `• ${s.status} @ ${new Date(s.timestamp).toLocaleString()}`).join('\n')}
      
      Incidents:
      ${incidents.map(i => `• ${i.type} (${i.severity}) at ${i.location}`).join('\n')}
    `;
  };