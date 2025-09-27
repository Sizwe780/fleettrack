function detectHazards(routeData, telemetry) {
    const alerts = [];
    routeData.path.forEach((point, i) => {
      if (telemetry[i]?.speed > 120) alerts.push({ type: "Overspeed", location: point });
      if (telemetry[i]?.brakePressure > 90) alerts.push({ type: "Hard Brake", location: point });
      if (telemetry[i]?.laneDeviation > 0.5) alerts.push({ type: "Lane Drift", location: point });
    });
    return alerts;
  }