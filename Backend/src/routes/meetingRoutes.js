const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
  endMeeting,
} = require('../controllers/meetingController');

const meetingValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Meeting title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
];

router.use(protect);

router.route('/')
  .post(meetingValidation, validateRequest, createMeeting)
  .get(getMeetings);

router.route('/:id')
  .get(getMeetingById)
  .put(updateMeeting)
  .delete(deleteMeeting);

router.get('/join/:roomId', joinMeeting);
router.post('/end/:roomId', endMeeting);

module.exports = router;