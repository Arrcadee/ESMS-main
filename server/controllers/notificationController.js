const notificationModel = require('../models/notificationModel');

// Get notifications for current user
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationModel.getNotificationsByUserId(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
      message: 'Notifications fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Mark single notification as read
const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Mark as read
    const notification = await notificationModel.markNotificationAsRead(id);
    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    return res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read for current user
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Mark all as read
    const count = await notificationModel.markAllNotificationsAsRead(userId);

    return res.status(200).json({
      success: true,
      data: { count },
      message: 'All notifications marked as read',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markNotificationAsRead, markAllNotificationsAsRead };
