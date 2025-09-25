// cockpit/engine/FIECore.js
import { QVectorEngine } from './QVectorEngine';
import { analyzeRoute } from './GeoIntel';
import { predictFailure } from './PartFailureTree';

const qEngine = new QVectorEngine();

export const runFleetIntelligence = ({ vehicle, route, parts }) => {
  const geo = analyzeRoute(route);
  const failures = predictFailure(parts);

  qEngine.entangle([
    { name: 'RouteVolatility', value: geo.volatilityScore, weight: 0.3 },
    { name: 'PartRisk', value: failures.filter(f => f.riskLevel === 'Critical').length, weight: 0.4 },
    { name: 'DriverFatigue', value: vehicle.fatigueIndex, weight: 0.3 }
  ]);

  const decisionTree = [
    { action: 'Reroute', factors: [{ value: geo.volatilityScore, weight: 0.5 }] },
    { action: 'Schedule Maintenance', factors: [{ value: failures.length, weight: 0.7 }] },
    { action: 'Alert Driver', factors: [{ value: vehicle.fatigueIndex, weight: 0.6 }] }
  ];

  const recommendations = qEngine.simulate(decisionTree);
  return {
    recommendations,
    trace: qEngine.exportTrace()
  };
};