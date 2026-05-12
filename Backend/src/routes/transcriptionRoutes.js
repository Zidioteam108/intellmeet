const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { transcribeAudio, getMeetingTranscriptions } = require('../controllers/transcriptionController');

// Store uploaded audio temporarily in uploads folder
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.mp4', '.wav', '.webm', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files allowed'));
    }
  },
});

router.use(protect);

router.post('/transcribe', upload.single('audio'), transcribeAudio);
router.get('/:meetingId', getMeetingTranscriptions);

module.exports = router;
