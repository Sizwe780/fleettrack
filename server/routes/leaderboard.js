const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const leaderboard = [
    { name: 'DR001', trips: 120, compliance: 98, incidents: 0 },
    { name: 'DR002', trips: 95, compliance: 92, incidents: 2 }
  ];

  res.json(leaderboard);
});

module.exports = router;