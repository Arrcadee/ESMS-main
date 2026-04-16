const { pool } = require('../config/db');

// Helper to convert snake_case to camelCase and add "building" alias
const formatVenue = (row) => ({
  id: row.id,
  name: row.name,
  location: row.location,
  building: row.location, // Alias for backward compatibility
  capacity: row.capacity,
  facilities: row.facilities || [],
  createdAt: row.created_at,
});

// Get all venues
const getAllVenues = async () => {
  const { rows } = await pool.query(
    `SELECT id, name, location, capacity, facilities,
            to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at
     FROM venues
     ORDER BY id`
  );
  return rows.map(formatVenue);
};

// Get venue by ID
const getVenueById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, name, location, capacity, facilities,
            to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at
     FROM venues WHERE id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  return formatVenue(rows[0]);
};

// Create venue
const createVenue = async (name, location, capacity, facilities) => {
  const { rows } = await pool.query(
    `INSERT INTO venues (name, location, capacity, facilities)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, location, capacity, facilities,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [name, location, capacity, facilities || []]
  );
  return formatVenue(rows[0]);
};

// Update venue
const updateVenue = async (venueId, name, location, capacity, facilities) => {
  const { rows } = await pool.query(
    `UPDATE venues
     SET name = COALESCE($1, name),
         location = COALESCE($2, location),
         capacity = COALESCE($3, capacity),
         facilities = COALESCE($4, facilities)
     WHERE id = $5
     RETURNING id, name, location, capacity, facilities,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [name || null, location || null, capacity || null, facilities || null, venueId]
  );
  if (!rows[0]) return null;
  return formatVenue(rows[0]);
};

// Delete venue
const deleteVenue = async (venueId) => {
  const { rowCount } = await pool.query('DELETE FROM venues WHERE id = $1', [venueId]);
  return rowCount > 0;
};

// Get venues with event count
const getVenuesWithEventCount = async () => {
  const { rows } = await pool.query(
    `SELECT v.id, v.name, v.location, v.capacity, v.facilities,
            to_char(v.created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at,
            COUNT(e.id) as event_count
     FROM venues v
     LEFT JOIN events e ON v.id = e.venue_id
     GROUP BY v.id, v.name, v.location, v.capacity, v.facilities, v.created_at
     ORDER BY v.id`
  );
  return rows.map(row => ({
    ...formatVenue(row),
    eventCount: parseInt(row.event_count, 10),
  }));
};

module.exports = {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  getVenuesWithEventCount,
};
