export const archiveSLABreach = ({ tripId, breachDetails }) => {
    const archive = {
      tripId,
      breachDetails,
      archivedAt: new Date().toISOString(),
    };
    console.log('🧾 SLA breach archived:', archive);
    return archive;
  };