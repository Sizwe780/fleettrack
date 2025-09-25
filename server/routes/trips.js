const express = require('express');
const router = express.Router();
const { createTrip, getTripById } = require('../controllers/tripController');

router.post('/', createTrip);         // POST /api/trips/submit
router.get('/:id', getTripById);      // GET /api/trips/submit/:id

module.exports = router;