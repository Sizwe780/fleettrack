const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const suggestions = [
    { driver: 'DR001', shift: '08:00–16:00', risk: 'Low' },
    { driver: 'DR002', shift: '10:00–18:00', risk: 'Moderate' }
  ];

  res.json(suggestions);
});

module.exports = router;