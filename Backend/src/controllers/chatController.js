const ChatMessage = require('../models/ChatMessage');

// Get chat history for a room
const getChatHistory = async (req, res) => {
  const { roomId } = req.params;
  const messages = await ChatMessage.find({ roomId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 })
    .limit(100);

  res.status(200).json({ success: true, messages });
};

module.exports = { getChatHistory };
