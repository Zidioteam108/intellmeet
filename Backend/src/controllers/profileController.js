const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private (requires JWT token)
// ─────────────────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  // req.user is set by the protect middleware
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

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update current user's profile
// @route   PUT /api/profile/update
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  const { name, bio } = req.body;

  // Only allow updating name and bio — not email or password here
  const allowedUpdates = {};
  if (name) allowedUpdates.name = name.trim();
  if (bio !== undefined) allowedUpdates.bio = bio.trim();

  // Validate name length if provided
  if (allowedUpdates.name && allowedUpdates.name.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name must be at least 2 characters',
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    allowedUpdates,
    { new: true, runValidators: true } // Returns updated doc, runs schema validators
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

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload avatar image to Cloudinary
// @route   POST /api/profile/avatar
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadAvatar = async (req, res) => {
  // multer middleware already uploaded the file to Cloudinary
  // req.file.path contains the Cloudinary URL
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  // If user had a previous avatar in Cloudinary, delete it to save space
  if (req.user.avatar && req.user.avatar.includes('cloudinary')) {
    try {
      // Extract public_id from the URL for deletion
      // URL format: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/subfolder/public_id.jpg
      const parts = req.user.avatar.split('/');
      const publicIdWithExt = parts.slice(-2).join('/'); // folder/public_id.jpg
      const publicId = publicIdWithExt.split('.')[0];    // folder/public_id
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      // Don't block the upload if old image deletion fails
      console.warn('Could not delete old avatar:', err.message);
    }
  }

  // Save the new Cloudinary URL to the user document
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
