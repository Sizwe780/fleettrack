router.get('/fleet-summary', (req, res) => {
    res.json({
      totalTrips: 128,
      incidentRate: 6.2,
      avgCompliance: 94.7,
      topDriver: 'Thabo Mokoena'
    });
  });