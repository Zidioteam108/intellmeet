const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateMeetingSummary,
  getMeetingSummary,
  toggleActionItem,
} = require('../controllers/summaryController');

router.use(protect);

router.post('/:meetingId/generate', generateMeetingSummary);
router.get('/:meetingId', getMeetingSummary);
router.patch('/:meetingId/action-items/:itemId/toggle', toggleActionItem);

module.exports = router;
