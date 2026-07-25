const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
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
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'member'],
        message: 'Role must be either admin or member',
      },
      default: 'member',
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving to DB
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare plain candidate password with hashed password
 * @param {string} candidatePassword 
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Sanitize user object for JSON serialization
userSchema.methods.toJSON = function () {
  const userObj = typeof this.toObject === 'function' ? this.toObject() : { ...this };
  if (this.name && !userObj.name) userObj.name = this.name;
  if (this.email && !userObj.email) userObj.email = this.email;
  if (this.role && !userObj.role) userObj.role = this.role;
  if (this._id && !userObj._id) userObj._id = this._id;
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.__v;
  return userObj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
