const crypto = require('crypto');

const generateRoomId = () => {
  return crypto.randomBytes(6).toString('hex');
};

module.exports = generateRoomId;