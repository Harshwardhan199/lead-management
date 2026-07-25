/**
 * Send consistent success JSON response
 * @param {Object} res Express response object
 * @param {number} statusCode HTTP status code
 * @param {string} message Description message
 * @param {Object|null} data Payload data
 */
const sendSuccess = (res, statusCode, message, data = null) => {
  const responsePayload = {
    success: true,
    message,
  };
  if (data !== null) {
    responsePayload.data = data;
  }
  return res.status(statusCode).json(responsePayload);
};

/**
 * Send consistent error JSON response
 * @param {Object} res Express response object
 * @param {number} statusCode HTTP status code
 * @param {string} message Error message
 * @param {Array|Object|null} errors Additional error details
 */
const sendError = (res, statusCode, message, errors = null) => {
  const responsePayload = {
    success: false,
    message,
  };
  if (errors !== null) {
    responsePayload.errors = errors;
  }
  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  sendSuccess,
  sendError,
};
