const express = require('express');
const router = express.Router();

let toggleRegistry = [
  { id: 'Patch-063', feature: 'IncidentReportForm', enabled: true },
  { id: 'Patch-064', feature: 'DriverHandoff', enabled: true },
  { id: 'Patch-065', feature: 'SentimentDashboard', enabled: false },
  { id: 'Patch-066', feature: 'DeliveryProofForm', enabled: true },
  { id: 'Patch-067', feature: 'ComplianceExportConsole', enabled: true },
  { id: 'Patch-068', feature: 'DriverMapViewer', enabled: true },
  { id: 'Patch-069', feature: 'ShiftOptimizer', enabled: false },
  { id: 'Patch-070', feature: 'DriverLeaderboard', enabled: true }
];

router.get('/', (req, res) => {
  res.json(toggleRegistry);
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;

  const index = toggleRegistry.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Toggle not found' });

  toggleRegistry[index].enabled = enabled;
  res.json({ message: 'Toggle updated', toggle: toggleRegistry[index] });
});

module.exports = router;