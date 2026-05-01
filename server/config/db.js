const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const connect = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0].now);
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, connect };