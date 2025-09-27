function compressRouteReplay(routeData) {
    const compressed = routeData.path.filter((_, i) => i % 5 === 0);
    const criticalEvents = routeData.events?.filter(e => e.type === "hazard" || e.type === "stop");
    return {
      compressedPath: compressed,
      criticalEvents,
      frameCount: compressed.length,
    };
  }