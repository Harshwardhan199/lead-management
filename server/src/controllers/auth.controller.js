const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response.utils');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const tokenUtils = require('../utils/token.utils');

/**
 * Get cookie options for Refresh Token
 * @returns {Object} Cookie options
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const { user, accessToken, refreshToken } = await authService.registerUser({
      name,
      email,
      password,
      role,
    });

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    return sendSuccess(res, 201, 'User registered successfully', {
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser({
      email,
      password,
    });

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    return sendSuccess(res, 200, 'Login successful', {
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token with Token Rotation
 */
const refresh = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(incomingRefreshToken);

    // Rotate refresh token in HttpOnly cookie
    res.cookie('refreshToken', newRefreshToken, getCookieOptions());

    return sendSuccess(res, 200, 'Access token refreshed successfully', {
      accessToken,
    });
  } catch (error) {
    // If refresh token fails, clear cookie
    res.clearCookie('refreshToken', getCookieOptions());
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    // Attempt to identify user from auth header or cookie if present
    let userId = req.user ? req.user.id : null;
    if (!userId && req.cookies.refreshToken) {
      try {
        const decoded = tokenUtils.verifyRefreshToken(req.cookies.refreshToken);
        userId = decoded.id;
      } catch (err) {
        // Ignore invalid refresh token decoding on logout
      }
    }

    if (userId) {
      await authService.logoutUser(userId);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', getCookieOptions());

    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, 200, 'Current user retrieved successfully', {
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
