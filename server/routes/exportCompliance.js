const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const format = req.query.format || 'csv';

  // TODO: Generate export from DB
  const fileBuffer = Buffer.from('compliance,data,goes,here');

  res.setHeader('Content-Disposition', `attachment; filename=compliance_export.${format}`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(fileBuffer);
});

module.exports = router;