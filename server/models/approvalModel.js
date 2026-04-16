const { pool } = require('../config/db');

// Helper to convert snake_case to camelCase
const formatApproval = (row) => ({
  id: row.id,
  eventId: row.event_id,
  approvedBy: row.approved_by,
  status: row.status,
  note: row.note,
  createdAt: row.created_at,
});

// Get all approvals with event and approver details
const getAllApprovals = async () => {
  const { rows } = await pool.query(
    `SELECT a.id, a.event_id, a.approved_by, a.status, a.note,
            to_char(a.created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at,
            e.title as event_title,
            u.name as approver_name
     FROM approvals a
     LEFT JOIN events e ON a.event_id = e.id
     LEFT JOIN users u ON a.approved_by = u.id
     ORDER BY a.created_at DESC`
  );
  return rows.map(row => ({
    ...formatApproval(row),
    eventTitle: row.event_title,
    approverName: row.approver_name,
  }));
};

// Get approval by event ID
const getApprovalByEventId = async (eventId) => {
  const { rows } = await pool.query(
    `SELECT id, event_id, approved_by, status, note,
            to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at
     FROM approvals WHERE event_id = $1
     LIMIT 1`,
    [eventId]
  );
  if (!rows[0]) return null;
  return formatApproval(rows[0]);
};

// Create approval
const createApproval = async (eventId, approvedBy, status, note) => {
  const { rows } = await pool.query(
    `INSERT INTO approvals (event_id, approved_by, status, note)
     VALUES ($1, $2, $3, $4)
     RETURNING id, event_id, approved_by, status, note,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [eventId, approvedBy, status, note || '']
  );
  return formatApproval(rows[0]);
};

// Update approval
const updateApproval = async (eventId, approvedBy, status, note) => {
  const { rows } = await pool.query(
    `UPDATE approvals
     SET approved_by = $1, status = $2, note = $3
     WHERE event_id = $4
     RETURNING id, event_id, approved_by, status, note,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [approvedBy, status, note || '', eventId]
  );
  if (!rows[0]) return null;
  return formatApproval(rows[0]);
};

module.exports = {
  getAllApprovals,
  getApprovalByEventId,
  createApproval,
  updateApproval,
};
