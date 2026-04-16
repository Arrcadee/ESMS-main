const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate avatar from name (first letter of each word, max 2 chars)
const generateAvatar = (name) => {
  const parts = name.split(' ');
  return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
};

// Register controller
const register = async (req, res, next) => {
  try {
    const { name, email, password, department, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required');
    }

    // Check email uniqueness
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      res.status(409);
      throw new Error('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate avatar
    const avatar = generateAvatar(name);

    // Create user
    const user = await userModel.createUser(
      name,
      email,
      hashedPassword,
      role || 'user',
      avatar,
      department || null
    );

    // Generate token
    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user,
      },
      message: 'User registered successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Login controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    // Find user
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
      message: 'Login successful',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
