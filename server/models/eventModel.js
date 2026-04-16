const { pool } = require('../config/db');

// Helper to convert snake_case to camelCase
const formatEvent = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  date: row.date, // YYYY-MM-DD format
  startTime: row.start_time,
  endTime: row.end_time,
  venueId: row.venue_id,
  organizerId: row.organizer_id,
  status: row.status,
  approvedBy: row.approved_by,
  approvalNote: row.approval_note,
  attendees: row.attendees,
  tags: row.tags || [],
  createdAt: row.created_at,
});

// Get all events
const getAllEvents = async () => {
  const { rows } = await pool.query(
    `SELECT id, title, description, category,
            to_char(date, 'YYYY-MM-DD') as date,
            start_time, end_time, venue_id, organizer_id,
            status, approved_by, approval_note, attendees, tags,
            to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at
     FROM events
     ORDER BY date DESC, start_time DESC`
  );
  return rows.map(formatEvent);
};

// Get event by ID
const getEventById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, title, description, category,
            to_char(date, 'YYYY-MM-DD') as date,
            start_time, end_time, venue_id, organizer_id,
            status, approved_by, approval_note, attendees, tags,
            to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at
     FROM events WHERE id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  return formatEvent(rows[0]);
};

// Create event
const createEvent = async (eventData) => {
  const {
    title,
    description,
    category,
    date,
    startTime,
    endTime,
    venueId,
    organizerId,
    tags,
  } = eventData;

  const { rows } = await pool.query(
    `INSERT INTO events
     (title, description, category, date, start_time, end_time, venue_id, organizer_id, status, attendees, approval_note, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id, title, description, category,
               to_char(date, 'YYYY-MM-DD') as date,
               start_time, end_time, venue_id, organizer_id,
               status, approved_by, approval_note, attendees, tags,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [title, description, category, date, startTime, endTime, venueId, organizerId, 'pending', 0, '', tags || []]
  );
  return formatEvent(rows[0]);
};

// Update event
const updateEvent = async (eventId, updates) => {
  const {
    title,
    description,
    category,
    date,
    startTime,
    endTime,
    venueId,
    tags,
  } = updates;

  const { rows } = await pool.query(
    `UPDATE events
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         category = COALESCE($3, category),
         date = COALESCE($4, date),
         start_time = COALESCE($5, start_time),
         end_time = COALESCE($6, end_time),
         venue_id = COALESCE($7, venue_id),
         tags = COALESCE($8, tags)
     WHERE id = $9
     RETURNING id, title, description, category,
               to_char(date, 'YYYY-MM-DD') as date,
               start_time, end_time, venue_id, organizer_id,
               status, approved_by, approval_note, attendees, tags,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [title, description, category, date, startTime, endTime, venueId, tags || null, eventId]
  );
  if (!rows[0]) return null;
  return formatEvent(rows[0]);
};

// Update event status (for approvals)
const updateEventStatus = async (eventId, status, approvedBy, approvalNote) => {
  const { rows } = await pool.query(
    `UPDATE events
     SET status = $1, approved_by = $2, approval_note = $3
     WHERE id = $4
     RETURNING id, title, description, category,
               to_char(date, 'YYYY-MM-DD') as date,
               start_time, end_time, venue_id, organizer_id,
               status, approved_by, approval_note, attendees, tags,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [status, approvedBy, approvalNote, eventId]
  );
  if (!rows[0]) return null;
  return formatEvent(rows[0]);
};

// Delete event
const deleteEvent = async (eventId) => {
  const { rowCount } = await pool.query('DELETE FROM events WHERE id = $1', [eventId]);
  return rowCount > 0;
};

// Get events by organizer
const getEventsByOrganizer = async (organizerId) => {
  const { rows } = await pool.query(
    `SELECT id, title, description, category,
            to_char(date, 'YYYY-MM-DD') as date,
            start_time, end_time, venue_id, organizer_id,
            status, approved_by, approval_note, attendees, tags,
            to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at
     FROM events WHERE organizer_id = $1
     ORDER BY date DESC`,
    [organizerId]
  );
  return rows.map(formatEvent);
};

// Get event count by category
const getEventCountByCategory = async () => {
  const { rows } = await pool.query(
    `SELECT category, COUNT(*) as count FROM events GROUP BY category ORDER BY category`
  );
  return rows;
};

// Get event count by month
const getEventCountByMonth = async () => {
  const { rows } = await pool.query(
    `SELECT
       EXTRACT(MONTH FROM date) as month_num,
       TO_CHAR(date, 'Mon') as month,
       COUNT(*) as count
     FROM events
     GROUP BY EXTRACT(MONTH FROM date), TO_CHAR(date, 'Mon')
     ORDER BY month_num`
  );
  return rows;
};

// Count events by status
const countEventsByStatus = async () => {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*) as count FROM events GROUP BY status`
  );
  const result = {
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  };
  rows.forEach(row => {
    result[row.status] = parseInt(row.count, 10);
  });
  return result;
};

// Get total attendees across all events
const getTotalAttendees = async () => {
  const { rows } = await pool.query('SELECT SUM(attendees) as total FROM events');
  return rows[0].total || 0;
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  getEventsByOrganizer,
  getEventCountByCategory,
  getEventCountByMonth,
  countEventsByStatus,
  getTotalAttendees,
};
