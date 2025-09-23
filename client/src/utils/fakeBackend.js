const FAKE_BACKEND_tripAnalysis = async (form, userId) => {
    const {
      currentLocation,
      origin,
      destination,
      cycleUsed,
      driver_name,
      date,
      departureTime,
    } = form;
  
    // 🔧 Simulated route path (mocked)
    const routePath = [
      [-33.96, 25.6], // Gqeberha
      [-34.2, 23.0],  // Rest stop
      [-34.0, 18.5],  // Cape Town
    ];
  
    const distanceMiles = 850;
    const drivingHours = 11;
    const pickupDropTime = 2; // 1hr each
    const totalHours = drivingHours + pickupDropTime;
    const fuelingRequired = distanceMiles >= 1000;
    const restRequired = drivingHours > 8;
  
    // 🔧 Compliance remarks
    const remarks = [];
    if (fuelingRequired) remarks.push('Fueling required at least once during this trip.');
    if (restRequired) remarks.push('Rest stop inserted after 8 hours driving.');
    remarks.push('1hr pickup and 1hr drop-off included.');
    remarks.push('Driver maintained HOS compliance.');
  
    // 🔧 Health score logic
    let healthScore = 100;
    if (restRequired) healthScore -= 5;
    if (fuelingRequired) healthScore -= 5;
  
    // 🔧 ELD log simulation
    const logs = [
      { day: 1, status: 'On Duty', duration: 1 },
      { day: 1, status: 'Driving', duration: 5.5 },
      { day: 1, status: 'Off Duty', duration: 0.5 },
      { day: 1, status: 'Driving', duration: 5.5 },
      { day: 1, status: 'On Duty', duration: 1 },
      { day: 1, status: 'Off Duty', duration: 10 },
    ];
  
    // 🔧 Multi-day log sheets
    const analysisLogs = [
      {
        day: 1,
        segments: ['Start', 'Midpoint', 'Rest'],
        entries: ['08:00 Start', '12:00 Break', '16:00 Rest Stop'],
      },
      {
        day: 2,
        segments: ['Restart', 'Final'],
        entries: ['07:00 Restart', '13:00 Final'],
      },
    ];
  
    // 🔧 Sanitize nested arrays
    const sanitizeLogEntry = (entry) => {
      const sanitized = {};
      for (const key in entry) {
        const value = entry[key];
        sanitized[key] = Array.isArray(value)
          ? value.map((item) => (Array.isArray(item) ? JSON.stringify(item) : item))
          : value;
      }
      return sanitized;
    };
  
    const safeAnalysisLogs = analysisLogs.map(sanitizeLogEntry);
  
    return {
      currentLocation,
      origin,
      destination,
      cycleUsed,
      driver_name,
      date,
      departureTime,
      dailyLogs: logs,
      routeData: {
        path: routePath,
        estimatedTime: `${totalHours}h`,
      },
      analysis: {
        profitability: {
          revenue: 12500,
          distanceMiles,
        },
        ifta: {
          fuelUsed: 320,
          taxOwed: 450,
        },
        remarks: remarks.join(' '),
        dailyLogs: safeAnalysisLogs,
      },
      healthScore,
    };
  };
  
  export default FAKE_BACKEND_tripAnalysis;