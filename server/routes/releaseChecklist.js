const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const checklist = [
    { module: 'IncidentReportForm', status: '✅ Passed', verifiedAt: '2025-09-22', notes: 'Photo upload stable' },
    { module: 'DriverHandoff', status: '✅ Passed', verifiedAt: '2025-09-21', notes: 'QR scan verified' },
    { module: 'SentimentDashboard', status: '⚠️ Needs review', verifiedAt: '2025-09-20', notes: 'Feedback scoring inconsistent' },
    { module: 'DeliveryProofForm', status: '✅ Passed', verifiedAt: '2025-09-23', notes: 'Signature + photo stable' },
    { module: 'ComplianceExportConsole', status: '✅ Passed', verifiedAt: '2025-09-23', notes: 'CSV + PDF verified' },
    { module: 'DriverMapViewer', status: '✅ Passed', verifiedAt: '2025-09-23', notes: 'Live map stable' },
    { module: 'ShiftOptimizer', status: '⚠️ Needs tuning', verifiedAt: '2025-09-22', notes: 'Fatigue scoring too lenient' },
    { module: 'DriverLeaderboard', status: '✅ Passed', verifiedAt: '2025-09-23', notes: 'Ranking logic verified' }
  ];

  res.json(checklist);
});

module.exports = router;