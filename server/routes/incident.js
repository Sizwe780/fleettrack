const express = require('express');
const multer = require('multer');
const { Incident } = require('../models/Incident');
const router = express.Router();

// Configure file storage
const storage = multer.memoryStorage(); // or diskStorage if saving locally
const upload = multer({ storage });

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { location, severity, description } = req.body;
    const photoBuffer = req.file?.buffer || null;

    const incident = new Incident({
      location,
      severity,
      description,
      photo: photoBuffer,
      timestamp: new Date(),
      submittedBy: req.user?.uid || 'anonymous'
    });

    await incident.save();
    res.status(201).json({ message: 'Incident logged successfully' });
  } catch (err) {
    console.error('Incident error:', err);
    res.status(500).json({ error: 'Failed to log incident' });
  }
});

module.exports = router;