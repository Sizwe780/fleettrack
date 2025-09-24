const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { origin, destination, time } = req.body;

  // 🔮 Simulated prediction logic
  const route = [
    { lat: -33.96, lng: 25.61 },
    { lat: -33.97, lng: 25.62 },
    { lat: -33.98, lng: 25.63 }
  ];

  res.json({
    route,
    eta: '7h 45m',
    risk: 'Low'
  });
});

module.exports = router;