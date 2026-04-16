const userModel = require('../models/userModel');

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.getAllUsers();
    return res.status(200).json({
      success: true,
      data: users,
      message: 'Users fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    return res.status(200).json({
      success: true,
      data: user,
      message: 'User fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validation
    if (!role) {
      res.status(400);
      throw new Error('Role is required');
    }

    const validRoles = ['user', 'organizer', 'admin', 'super Admin'];
    if (!validRoles.includes(role)) {
      res.status(400);
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Update user
    const user = await userModel.updateUserRole(id, role);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: 'User role updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole };
