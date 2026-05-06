const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { signup, login, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Rate limiter — allows only 10 attempts per 15 minutes on auth routes
// This blocks brute-force attacks where someone tries many passwords
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no login required)
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Protected test route (requires login) — useful for testing middleware
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;