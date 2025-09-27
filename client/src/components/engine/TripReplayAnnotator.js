function annotateReplay(routeData, telemetry) {
    return routeData.path.map((point, i) => {
      const t = telemetry[i];
      const annotations = [];
      if (t.speed > 120) annotations.push("Overspeed");
      if (t.brakePressure > 90) annotations.push("Hard Brake");
      if (t.laneDeviation > 0.5) annotations.push("Lane Drift");
      return { location: point, annotations };
    }).filter(p => p.annotations.length > 0);
  }