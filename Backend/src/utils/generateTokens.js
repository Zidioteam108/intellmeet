const jwt = require('jsonwebtoken');

// Creates a short-lived access token (15 minutes by default)
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Creates a long-lived refresh token (7 days by default)
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
