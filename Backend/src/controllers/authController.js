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
      message: 'Name, email and password are required',
    });
  }

  // Validation: Password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
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

  // 6. Set refresh token in an HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // Required for SameSite=None
    sameSite: 'none', // Allow cross-site cookies for Vercel
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // 7. Send response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    accessToken,
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
const refreshAccessToken = async (req, res) => {
  // Get refresh token from cookie
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token not found. Please login again.',
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Find user in database WITH refreshToken field
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. Please login again.',
      });
    }

    // Create a new access token
    const newAccessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token expired. Please login again.',
    });
  }
};

const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    // Remove refresh token from database
    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null }
    );
  }

  // Clear the cookie
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    // To prevent email enumeration, we return success even if user doesn't exist
    return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  }

  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash it and set to resetPasswordToken field
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expire time to 15 minutes
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT or POST request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  const { password } = req.body;
  
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  // Get hashed token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  // Find user by token and check if it has not expired
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
};

module.exports = { signup, login, refreshAccessToken, logout, forgotPassword, resetPassword };
