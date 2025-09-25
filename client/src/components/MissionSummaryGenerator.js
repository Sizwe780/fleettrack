export const generateMissionSummary = ({ mission, events }) => {
    const delays = events.filter(e => e.systemStatus !== 'Nominal');
    const fuelDrops = events.filter(e => e.fuelLevel < 25);
    const summary = `
      Mission ${mission.id} launched by Commander ${mission.commander} aboard ${mission.vehicle}.
      Duration: ${events.length * 10} seconds.
      ${delays.length} system anomalies detected.
      ${fuelDrops.length} low-fuel warnings triggered.
      Mission status: ${delays.length > 0 ? 'Risk encountered' : 'Nominal'}.
    `;
    return summary.trim();
  };