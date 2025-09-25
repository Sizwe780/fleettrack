export const optimizeCargoRouting = ({ cargo, vehicles }) => {
    return cargo.map((c, i) => {
      const assigned = vehicles[i % vehicles.length];
      const routeRisk = c.tempSensitive ? 'Low-risk corridor suggested' : 'Standard route';
      return {
        cargoId: c.id,
        vehicleId: assigned.id,
        route: routeRisk,
      };
    });
  };