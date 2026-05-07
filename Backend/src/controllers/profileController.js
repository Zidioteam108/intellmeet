const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio || '',
      createdAt: user.createdAt,
    },
  });
};

// @desc    Update current user's profile
// @route   PUT /api/profile/update
// @access  Private
const updateProfile = async (req, res) => {
  const { name, bio } = req.body;

  const allowedUpdates = {};
  if (name) allowedUpdates.name = name.trim();
  if (bio !== undefined) allowedUpdates.bio = bio.trim();

  if (allowedUpdates.name && allowedUpdates.name.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name must be at least 2 characters',
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    allowedUpdates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio || '',
    },
  });
};

// @desc    Upload avatar image to Cloudinary
// @route   POST /api/profile/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  if (req.user.avatar && req.user.avatar.includes('cloudinary')) {
    try {
      const parts = req.user.avatar.split('/');
      const publicIdWithExt = parts.slice(-2).join('/');
      const publicId = publicIdWithExt.split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn('Could not delete old avatar:', err.message);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.path },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    avatar: updatedUser.avatar,
  });
};

module.exports = { getProfile, updateProfile, uploadAvatar };
