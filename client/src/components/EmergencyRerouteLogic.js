export const rerouteInEmergency = ({ route, alerts }) => {
    const rerouted = alerts.some(a => route.includes(a.zone));
    return {
      originalRoute: route,
      rerouted: rerouted ? route.filter(r => !alerts.map(a => a.zone).includes(r)) : route,
      alertTriggered: rerouted,
    };
  };