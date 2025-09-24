const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('photo'), async (req, res) => {
  const { packageId, recipientName, signature } = req.body;
  const photo = req.file?.buffer;

  // TODO: Save to DB or storage
  res.status(201).json({ message: 'Delivery proof submitted' });
});

module.exports = router;