const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, approvalController.getAllApprovals);
router.post('/:eventId', protect, adminOnly, approvalController.submitApproval);
router.put('/:eventId', protect, adminOnly, approvalController.submitApproval);

module.exports = router;
