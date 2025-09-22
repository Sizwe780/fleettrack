const FAKE_BACKEND_tripAnalysis = async (form, userId) => {
    const { origin, destination, cycleUsed, driver_name, date, departureTime } = form;
  
    return {
      origin,
      destination,
      cycleUsed,
      driver_name,
      date,
      departureTime,
      routeData: {
        path: [[-33.96, 25.6], [-34.0, 18.5]],
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
        dailyLogs: [
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
        ],
      },
    };
  };
  
  export default FAKE_BACKEND_tripAnalysis;