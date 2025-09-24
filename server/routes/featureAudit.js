const express = require('express');
const router = express.Router();

const auditLog = [
  {
    timestamp: '2025-09-23T08:45:00Z',
    action: 'Toggle Enabled',
    feature: 'ShiftOptimizer',
    user: 'admin@sizwe.dev',
    details: 'Enabled experimental fatigue scoring'
  },
  {
    timestamp: '2025-09-22T17:30:00Z',
    action: 'Patch Deployed',
    feature: 'DeliveryProofForm',
    user: 'admin@sizwe.dev',
    details: 'Patch-066 deployed to production'
  },
  {
    timestamp: '2025-09-21T14:10:00Z',
    action: 'Toggle Disabled',
    feature: 'SentimentDashboard',
    user: 'qa@sizwe.dev',
    details: 'Disabled due to scoring inconsistency'
  }
];

router.get('/', (req, res) => {
  res.json(auditLog);
});

module.exports = router;