const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found, deny access
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in first.',
    });
  }

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Find the user attached to this token
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'The user belonging to this token no longer exists.',
    });
  }

  // Attach user to request object so controllers can use it
  req.user = currentUser;
  next();
};

module.exports = { protect };