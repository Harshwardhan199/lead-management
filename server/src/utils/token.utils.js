const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const env = require('../config/env');

/**
 * Generate Access Token
 * @param {Object} payload 
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generate Refresh Token
 * @param {Object} payload 
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Verify Access Token
 * @param {string} token 
 * @returns {Object} Decoded payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
};

/**
 * Verify Refresh Token
 * @param {string} token 
 * @returns {Object} Decoded payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
};

/**
 * Hash a refresh token string for DB storage
 * @param {string} token 
 * @returns {Promise<string>} Hashed token
 */
const hashRefreshToken = async (token) => {
  return await bcrypt.hash(token, 10);
};

/**
 * Compare plain refresh token with stored hashed refresh token
 * @param {string} token 
 * @param {string} hashedToken 
 * @returns {Promise<boolean>}
 */
const compareRefreshToken = async (token, hashedToken) => {
  if (!token || !hashedToken) return false;
  return await bcrypt.compare(token, hashedToken);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
  compareRefreshToken,
};
