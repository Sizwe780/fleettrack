// utils/tripScorer.js

export default function scoreTrip(trip) {
    const fuelUsed = trip.analysis?.ifta?.fuelUsed ?? 0;
    const netProfit = trip.analysis?.profitability?.netProfit ?? 0;
    const routeDeviation = calculateRouteDeviation(trip.routeData?.path);
    const hosRemarks = trip.analysis?.remarks ?? '';
  
    const efficiencyScore = Math.max(0, 100 - fuelUsed * 0.5 + netProfit * 0.1);
    const riskScore = Math.min(100, routeDeviation * 2);
    const compliance = !hosRemarks.toLowerCase().includes('violation');
  
    return {
      efficiency: Math.round(efficiencyScore),
      risk: Math.round(riskScore),
      compliance
    };
  }
  
  function calculateRouteDeviation(pathStr) {
    try {
      const path = JSON.parse(pathStr);
      const plannedDistance = haversine(path[0], path[path.length - 1]);
      const actualDistance = path.reduce((acc, curr, i, arr) => {
        if (i === 0) return acc;
        return acc + haversine(arr[i - 1], curr);
      }, 0);
      return Math.abs(actualDistance - plannedDistance);
    } catch {
      return 0;
    }
  }
  
  function haversine([lat1, lon1], [lat2, lon2]) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }