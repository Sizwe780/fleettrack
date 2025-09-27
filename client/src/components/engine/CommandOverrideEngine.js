function overrideTripCommand(tripId, field, value, authCode) {
    const isAuthorized = authCode?.startsWith("CMD-") && authCode.length > 10;
    if (!isAuthorized) return { success: false, reason: "Invalid override code" };
  
    return {
      success: true,
      override: { tripId, field, newValue: value, timestamp: Date.now() },
    };
  }