export const detectAnomalies = ({ telemetry }) => {
    return telemetry.map((t, i) => ({
      timestamp: t.timestamp,
      anomaly: t.speed > 1200 || t.fuelLevel < 5 ? '🚨 Detected' : null,
    }));
  };