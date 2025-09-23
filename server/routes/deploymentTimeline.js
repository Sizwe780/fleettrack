const express = require('express');
const router = express.Router();

const timeline = [
  {
    date: '2025-09-18',
    module: 'IncidentReportForm',
    patchId: 'Patch-063',
    status: 'Live',
    description: 'Incident logging with photo upload and severity scoring'
  },
  {
    date: '2025-09-19',
    module: 'DriverHandoff',
    patchId: 'Patch-064',
    status: 'Live',
    description: 'Driver UID handoff tracking with timestamp logging'
  },
  {
    date: '2025-09-20',
    module: 'SentimentDashboard',
    patchId: 'Patch-065',
    status: 'Experimental',
    description: 'Driver morale and feedback scoring dashboard'
  },
  {
    date: '2025-09-21',
    module: 'DeliveryProofForm',
    patchId: 'Patch-066',
    status: 'Live',
    description: 'Package ID, recipient signature, and photo confirmation'
  },
  {
    date: '2025-09-22',
    module: 'ComplianceExportConsole',
    patchId: 'Patch-067',
    status: 'Live',
    description: 'Export compliance archive in CSV, PDF, and JSON formats'
  },
  {
    date: '2025-09-23',
    module: 'DriverMapViewer',
    patchId: 'Patch-068',
    status: 'Live',
    description: 'Live GPS map of active drivers with role-based filters'
  },
  {
    date: '2025-09-23',
    module: 'ShiftOptimizer',
    patchId: 'Patch-069',
    status: 'Experimental',
    description: 'Predictive shift suggestions based on fatigue and performance'
  },
  {
    date: '2025-09-23',
    module: 'DriverLeaderboard',
    patchId: 'Patch-070',
    status: 'Live',
    description: 'Driver ranking by trips, compliance, and incident-free streak'
  }
];

router.get('/', (req, res) => {
  res.json(timeline);
});

module.exports = router;