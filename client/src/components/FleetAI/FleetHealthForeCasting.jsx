function forecastMaintenance(vehicle) {
    const { mileage, terrainHistory, lastServiceDate, telemetry } = vehicle;
    const wearFactor = terrainHistory.includes("gravel") ? 1.3 : 1;
    const engineTempAvg = telemetry.reduce((sum, t) => sum + t.engineTemp, 0) / telemetry.length;
    const nextServiceKm = Math.max(5000, 10000 - mileage * wearFactor + engineTempAvg * 2);
  
    return {
      nextServiceDue: `${Math.round(nextServiceKm)} km`,
      urgency: nextServiceKm < 2000 ? "High" : "Normal",
    };
  }