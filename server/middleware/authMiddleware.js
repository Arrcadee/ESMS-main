const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Not authorised, no token',
      });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      'SELECT id, name, email, role, avatar, department FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows[0]) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token invalid or expired',
      });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Token invalid or expired',
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super Admin')) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'Admin access required',
    });
  }
  next();
};

module.exports = { protect, adminOnly };
