function getTierFeatures(tier) {
    switch (tier) {
      case "free": return ["tracking", "replay"];
      case "pro": return ["dispatch", "audit"];
      case "enterprise": return ["cognition", "export"];
      default: return [];
    }
  }