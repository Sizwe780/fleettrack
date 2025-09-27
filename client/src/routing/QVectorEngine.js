// src/routing/QVectorEngine.js
import { getTrafficData, getFuelEstimates } from '../utils/RouteIntel';

export function QVectorEngine(origin, destination, fleetProfile) {
  const traffic = getTrafficData(origin, destination);
  const fuel = getFuelEstimates(origin, destination, fleetProfile);

  const routeScore = (traffic.congestionLevel * 0.6) + (fuel.usageEstimate * 0.4);

  return {
    origin,
    destination,
    routeScore,
    recommendedRoute: traffic.bestRoute,
    estimatedFuel: fuel.usageEstimate,
    eta: traffic.estimatedTime,
  };
}