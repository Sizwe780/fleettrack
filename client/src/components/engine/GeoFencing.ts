export function checkGeoFence(location, zones) {
    if (
      !location ||
      typeof location.lat !== "number" ||
      typeof location.lng !== "number" ||
      !Array.isArray(zones)
    ) return false;
  
    const { lat, lng } = location;
  
    return zones.find(zone => {
      const withinLat = Math.abs(lat - zone.lat) <= zone.radius;
      const withinLng = Math.abs(lng - zone.lng) <= zone.radius;
      return withinLat && withinLng;
    }) || null;
  }
  
  export function triggerGeoFenceAlert(session, location, zones) {
    if (!session || !location || !zones) return null;
  
    const breachedZone = checkGeoFence(location, zones);
  
    if (breachedZone) {
      const alertMessage = `Geo-fence breach detected in zone "${breachedZone.name || "Unnamed"}". Dispatching ProtectionUnit.`;
  
      const alertPayload = {
        sender: "FleetAI",
        message: alertMessage,
        timestamp: Date.now(),
        zone: breachedZone.name || null,
        severity: breachedZone.severity || "moderate"
      };
  
      if (Array.isArray(session.messages)) {
        session.messages.push(alertPayload);
      }
  
      return alertPayload;
    }
  
    return {
      sender: "FleetAI",
      message: "Location verified. No geo-fence breach detected.",
      timestamp: Date.now(),
      severity: "info"
    };
  }