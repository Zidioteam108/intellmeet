const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Password will NOT be returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      trim: true,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false, // never send this to frontend by default
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── HASH PASSWORD BEFORE SAVING ────────────────────────────────────────────
// This runs automatically before every .save() call
// It hashes the password only if it was changed (prevents re-hashing on other updates)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12); // 12 rounds = strong hashing
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── COMPARE PASSWORD METHOD ─────────────────────────────────────────────────
// This is called during login to check if entered password matches hashed one
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
