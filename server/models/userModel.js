const { pool } = require('../config/db');

// Get all users (excluding passwords)
const getAllUsers = async () => {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, avatar, department, 
            to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at
     FROM users
     ORDER BY id`
  );
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar,
    department: row.department,
    createdAt: row.created_at,
  }));
};

// Get user by ID
const getUserById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, avatar, department,
            to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at
     FROM users WHERE id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    role: rows[0].role,
    avatar: rows[0].avatar,
    department: rows[0].department,
    createdAt: rows[0].created_at,
  };
};

// Get user by email (for login)
const getUserByEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, password, role, avatar, department,
            to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at
     FROM users WHERE email = $1`,
    [email]
  );
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    password: rows[0].password,
    role: rows[0].role,
    avatar: rows[0].avatar,
    department: rows[0].department,
    createdAt: rows[0].created_at,
  };
};

// Create user
const createUser = async (name, email, hashedPassword, role, avatar, department) => {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role, avatar, department)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role, avatar, department,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [name, email, hashedPassword, role, avatar, department]
  );
  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    role: rows[0].role,
    avatar: rows[0].avatar,
    department: rows[0].department,
    createdAt: rows[0].created_at,
  };
};

// Update user role
const updateUserRole = async (userId, newRole) => {
  const { rows } = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, name, email, role, avatar, department,
               to_char(created_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as created_at`,
    [newRole, userId]
  );
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    role: rows[0].role,
    avatar: rows[0].avatar,
    department: rows[0].department,
    createdAt: rows[0].created_at,
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUserRole,
};
