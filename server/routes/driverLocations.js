const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const drivers = [
    { name: 'DR001', lat: -33.96, lng: 25.61, role: 'driver', status: 'active' },
    { name: 'DR002', lat: -33.95, lng: 25.62, role: 'driver', status: 'idle' }
  ];

  res.json(drivers);
});

module.exports = router;