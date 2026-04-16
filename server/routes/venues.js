const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', venueController.getAllVenues);
router.get('/:id', venueController.getVenueById);
router.post('/', protect, adminOnly, venueController.createVenue);
router.put('/:id', protect, adminOnly, venueController.updateVenue);
router.delete('/:id', protect, adminOnly, venueController.deleteVenue);

module.exports = router;
