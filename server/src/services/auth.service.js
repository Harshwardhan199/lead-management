const User = require('../models/user.model');
const tokenUtils = require('../utils/token.utils');
const ApiError = require('../utils/apiError');

/**
 * Register a new user
 * @param {Object} userData 
 * @returns {Promise<Object>} User, accessToken, and refreshToken
 */
const registerUser = async ({ name, email, password, role }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Create user instance
  const user = new User({
    name,
    email,
    password,
    role: role || 'member',
  });

  // Generate tokens
  const tokenPayload = { id: user._id, email: user.email, role: user.role };
  const accessToken = tokenUtils.generateAccessToken(tokenPayload);
  const refreshToken = tokenUtils.generateRefreshToken({ id: user._id });

  // Store hashed refresh token in database
  const hashedRefreshToken = await tokenUtils.hashRefreshToken(refreshToken);
  user.refreshToken = hashedRefreshToken;

  // Save user with hashed password and refresh token
  await user.save();

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Login existing user
 * @param {Object} credentials 
 * @returns {Promise<Object>} User, accessToken, and refreshToken
 */
const loginUser = async ({ email, password }) => {
  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check password match
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate tokens
  const tokenPayload = { id: user._id, email: user.email, role: user.role };
  const accessToken = tokenUtils.generateAccessToken(tokenPayload);
  const refreshToken = tokenUtils.generateRefreshToken({ id: user._id });

  // Store hashed refresh token
  const hashedRefreshToken = await tokenUtils.hashRefreshToken(refreshToken);
  user.refreshToken = hashedRefreshToken;
  await user.save();

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token and rotate refresh token
 * @param {string} incomingRefreshToken 
 * @returns {Promise<Object>} new accessToken and rotated refreshToken
 */
const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  let decoded;
  try {
    decoded = tokenUtils.verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  // Find user with refreshToken selected
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || !user.refreshToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Compare incoming refresh token with hashed token in DB
  const isTokenValid = await tokenUtils.compareRefreshToken(
    incomingRefreshToken,
    user.refreshToken
  );

  if (!isTokenValid) {
    // Immediate revocation of refresh token on reuse / mismatch attempt
    user.refreshToken = null;
    await user.save();
    throw new ApiError(401, 'Invalid refresh token. Session revoked');
  }

  // Refresh Token Rotation: Generate brand new token pair
  const tokenPayload = { id: user._id, email: user.email, role: user.role };
  const newAccessToken = tokenUtils.generateAccessToken(tokenPayload);
  const newRefreshToken = tokenUtils.generateRefreshToken({ id: user._id });

  // Save new hashed refresh token (immediately invalidating the old refresh token)
  const hashedNewRefreshToken = await tokenUtils.hashRefreshToken(newRefreshToken);
  user.refreshToken = hashedNewRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout user by clearing stored refresh token
 * @param {string} userId 
 */
const logoutUser = async (userId) => {
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }
};

/**
 * Fetch current user details
 * @param {string} userId 
 * @returns {Promise<Object>} user document
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

/**
 * Get all registered users (for lead assignment target selection)
 * @returns {Promise<Array>} Array of user objects
 */
const getAllUsers = async () => {
  return await User.find({}).sort({ createdAt: -1 });
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  getAllUsers,
};
