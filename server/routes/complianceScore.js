const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const scores = [
    { driver: 'DR001', score: 98.5, violations: 0 },
    { driver: 'DR002', score: 92.3, violations: 2 }
  ];

  res.json(scores);
});

module.exports = router;