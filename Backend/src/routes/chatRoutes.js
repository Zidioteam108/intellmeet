const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChatHistory } = require('../controllers/chatController');

router.use(protect);
router.get('/:roomId/history', getChatHistory);

module.exports = router;
