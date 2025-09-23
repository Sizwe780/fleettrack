const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const registry = [
    { id: 'Patch-063', module: 'IncidentReportForm', status: 'Live', toggle: true, updatedAt: '2025-09-22' },
    { id: 'Patch-064', module: 'DriverHandoff', status: 'Live', toggle: true, updatedAt: '2025-09-21' },
    { id: 'Patch-065', module: 'SentimentDashboard', status: 'Experimental', toggle: false, updatedAt: '2025-09-20' },
    { id: 'Patch-066', module: 'DeliveryProofForm', status: 'Live', toggle: true, updatedAt: '2025-09-23' },
    { id: 'Patch-067', module: 'ComplianceExportConsole', status: 'Live', toggle: true, updatedAt: '2025-09-23' },
    { id: 'Patch-068', module: 'DriverMapViewer', status: 'Live', toggle: true, updatedAt: '2025-09-23' },
    { id: 'Patch-069', module: 'ShiftOptimizer', status: 'Experimental', toggle: false, updatedAt: '2025-09-22' },
    { id: 'Patch-070', module: 'DriverLeaderboard', status: 'Live', toggle: true, updatedAt: '2025-09-23' }
  ];

  res.json(registry);
});

module.exports = router;