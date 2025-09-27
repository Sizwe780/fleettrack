// src/mock/mockPayload.js
const mockPayload = {
    trip: {
      id: "trip-001",
      origin: "Gqeberha",
      destination: "Cape Town",
      analysis: {
        distance: 800,
        terrainType: "urban",
        weatherRisk: 20,
        trafficScore: 35,
        slaMinutes: 600,
        fuelUsed: 90,
        tollFees: 120,
        slaPenalty: 50,
        cargoValue: 5000,
        riskLevel: "medium",
        slaBreached: true
      },
      routeData: {
        path: Array(100).fill({ lat: -33.96, lng: 25.6 }),
        events: [{ type: "hazard", location: { lat: -33.97, lng: 25.61 } }]
      },
      auditHash: "abc123"
    },
    driver: {
      name: "Thabo",
      fatigueLevel: 45,
      incidentCount: 2,
      avgRouteComplexity: 60,
      shiftHours: 8,
      breaksTaken: 1,
      biometric: [{ heartRate: 85 }, { heartRate: 90 }]
    },
    vehicle: {
      id: "vehicle-001",
      mileage: 120000,
      terrainHistory: ["urban", "gravel"],
      lastServiceDate: "2025-08-01",
      telemetry: Array(100).fill({ engineTemp: 85 })
    },
    telemetry: Array(100).fill({
      timestamp: Date.now(),
      speed: 100,
      brakePressure: 30,
      laneDeviation: 0.1,
      location: { lat: -33.96, lng: 25.6 }
    }),
    route: {
      terrainType: "urban",
      trafficScore: 35,
      weatherRisk: 20,
      urbanDensity: 70,
      routeData: {
        path: Array(100).fill({ lat: -33.96, lng: 25.6 }),
        events: []
      }
    },
    trips: [], // Add more mock trips if needed
    drivers: [], // Add more mock drivers if needed
    vehicles: [] // Add more mock vehicles if needed
  };
  
  export default mockPayload;