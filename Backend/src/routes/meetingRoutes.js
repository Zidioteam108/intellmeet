const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
} = require('../controllers/meetingController');

router.use(protect);

router.route('/')
  .post(createMeeting)
  .get(getMeetings);

router.route('/:id')
  .get(getMeetingById)
  .put(updateMeeting)
  .delete(deleteMeeting);

router.get('/join/:roomId', joinMeeting);

module.exports = router;