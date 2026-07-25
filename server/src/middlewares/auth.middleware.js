const tokenUtils = require('../utils/token.utils');
const ApiError = require('../utils/apiError');

/**
 * Middleware to authenticate requests using Bearer access token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Access token is required');
    }

    let decoded;
    try {
      decoded = tokenUtils.verifyAccessToken(token);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired access token');
    }

    // Attach user payload to request
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};
