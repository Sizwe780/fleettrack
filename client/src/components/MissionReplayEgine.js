export const replayMissionTimeline = (events) => {
    return events.map((e, i) => ({
      timestamp: e.timestamp,
      velocity: `${Math.round(e.velocity)} km/h`,
      fuel: `${Math.round(e.fuelLevel)}%`,
      status: e.systemStatus,
      marker: i === 0 ? '🚀 Launch' : i === events.length - 1 ? '🛬 Landing' : '',
    }));
  };