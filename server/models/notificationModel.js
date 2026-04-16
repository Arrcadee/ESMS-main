const { pool } = require('../config/db');

// Helper to convert snake_case to camelCase
const formatNotification = (row) => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  title: row.title,
  message: row.message,
  eventId: row.event_id,
  read: row.read,
  createdAt: row.created_at,
});

// Get notifications for a user
const getNotificationsByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT id, user_id, type, title, message, event_id, read,
            to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at
     FROM notifications WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(formatNotification);
};

// Create notification
const createNotification = async (userId, type, title, message, eventId = null) => {
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, event_id, read)
     VALUES ($1, $2, $3, $4, $5, false)
     RETURNING id, user_id, type, title, message, event_id, read,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [userId, type, title, message, eventId]
  );
  return formatNotification(rows[0]);
};

// Mark notification as read
const markNotificationAsRead = async (notificationId) => {
  const { rows } = await pool.query(
    `UPDATE notifications SET read = true WHERE id = $1
     RETURNING id, user_id, type, title, message, event_id, read,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [notificationId]
  );
  if (!rows[0]) return null;
  return formatNotification(rows[0]);
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
  const { rowCount } = await pool.query(
    `UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`,
    [userId]
  );
  return rowCount;
};

module.exports = {
  getNotificationsByUserId,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
