const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadAvatar } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar: uploadMiddleware } = require('../config/cloudinary');

// All profile routes require authentication
router.use(protect);

router.get('/me', getProfile);
router.put('/update', updateProfile);
router.post('/avatar', uploadMiddleware.single('avatar'), uploadAvatar);

module.exports = router;
