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

/**
 * Middleware to authorize requests based on user roles
 * @param  {...string} allowedRoles Roles allowed to access the route ('admin', 'member', etc.)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required before authorization'));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          'Forbidden: You do not have permission to access this resource'
        )
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
