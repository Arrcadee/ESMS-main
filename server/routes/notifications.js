const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, notificationController.getNotifications);
router.put('/mark-all-read', protect, notificationController.markAllNotificationsAsRead); // specific first
router.put('/:id/read', protect, notificationController.markNotificationAsRead);          // param after

module.exports = router;