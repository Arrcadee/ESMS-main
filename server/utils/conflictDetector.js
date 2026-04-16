const { pool } = require('../config/db');

const timeToMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const detectConflicts = async (newEvent, excludeId = null) => {
  try {
    let query = `
      SELECT id, title, start_time, end_time
      FROM events
      WHERE date = $1
        AND venue_id = $2
        AND status NOT IN ('rejected', 'completed')
    `;
    let params = [newEvent.date, newEvent.venueId];

    if (excludeId) {
      query += ' AND id != $3';
      params.push(excludeId);
    }

    const { rows } = await pool.query(query, params);

    const newStart = timeToMin(newEvent.startTime);
    const newEnd = timeToMin(newEvent.endTime);

    return rows.filter((ev) => {
      const existStart = timeToMin(ev.start_time);
      const existEnd = timeToMin(ev.end_time);
      return newStart < existEnd && newEnd > existStart;
    });
  } catch (err) {
    throw new Error('Conflict detection failed: ' + err.message);
  }
};

module.exports = { detectConflicts };
