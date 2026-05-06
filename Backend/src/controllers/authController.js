const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check that all fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password',
    });
  }

  // 2. Check if a user with this email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists',
    });
  }

  // 3. Create the new user (password is hashed automatically by the model hook)
  const user = await User.create({ name, email, password });

  // 4. Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // 5. Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 6. Send response (never send password back)
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login an existing user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Check that fields are provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  // 2. Find user — explicitly include password field (it's hidden by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password', // Don't reveal which one is wrong
    });
  }

  // 3. Compare entered password with stored hashed password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // 4. Generate new tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // 5. Save new refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 6. Send response
  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public (but needs valid refresh token)
// ─────────────────────────────────────────────────────────────────────────────
const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  // Verify the refresh token
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  // Find user and check that the token matches
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }

  // Issue a new access token
  const newAccessToken = generateAccessToken(user._id);

  res.status(200).json({
    success: true,
    accessToken: newAccessToken,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Logout — clears refresh token from database
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  const { refreshToken: token } = req.body;

  if (token) {
    // Remove refresh token from database
    await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: '' });
  }

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { signup, login, refreshToken, logout };
