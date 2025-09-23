const FAKE_BACKEND_tripAnalysis = async (form, userId) => {
    const {
      destination,
      cycleUsed,
      driver_name,
      date,
      departureTime,
    } = form;
  
    const origin = 'Gqeberha, EC'; // You may want to pass this in via form too
  
    const logs = [
      { day: 1, status: 'On Duty', duration: 1 },
      { day: 1, status: 'Driving', duration: 5.5 },
      { day: 1, status: 'Off Duty', duration: 0.5 },
      { day: 1, status: 'Driving', duration: 5.5 },
      { day: 1, status: 'On Duty', duration: 1 },
      { day: 1, status: 'Off Duty', duration: 10 },
    ];
  
    // 🔧 Sanitize nested arrays inside analysis.dailyLogs
    const sanitizeLogEntry = (entry) => {
      const sanitized = {};
      for (const key in entry) {
        const value = entry[key];
        if (Array.isArray(value)) {
          sanitized[key] = value.map((item) =>
            Array.isArray(item) ? JSON.stringify(item) : item
          );
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };
  
    const analysisLogs = [
      {
        day: 1,
        segments: ['Start', 'Midpoint', 'End'],
        entries: ['08:00 Start', '12:00 Break', '18:00 End'],
      },
      {
        day: 2,
        segments: ['Restart', 'Final'],
        entries: ['07:00 Restart', '13:00 Final'],
      },
    ];
  
    const safeAnalysisLogs = analysisLogs.map(sanitizeLogEntry);
  
    return {
      origin,
      destination,
      cycleUsed,
      driver_name,
      date,
      departureTime,
      dailyLogs: logs,
      routeData: {
        path: [[-33.96, 25.6], [-34.0, 18.5]], // This is fine: array of coordinates
        estimatedTime: '12h 30m',
      },
      analysis: {
        profitability: {
          revenue: 12500,
          distanceMiles: 850,
        },
        ifta: {
          fuelUsed: 320,
          taxOwed: 450,
        },
        remarks: 'Driver maintained HOS compliance. 1hr pickup/drop-off included.',
        dailyLogs: safeAnalysisLogs,
      },
    };
  };
  
  export default FAKE_BACKEND_tripAnalysis;