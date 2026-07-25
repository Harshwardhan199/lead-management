const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');
const { LEAD_STATUS_ENUM } = require('../models/lead.model');

// Helper to handle express-validator result
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return next(new ApiError(400, 'Validation failed', errorMessages));
  }
  next();
};

const createLeadValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email address is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('status')
    .optional()
    .isIn(LEAD_STATUS_ENUM)
    .withMessage(`Status must be one of: ${LEAD_STATUS_ENUM.join(', ')}`),
  validate,
];

const updateLeadValidation = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email address is required'),
  body('status')
    .optional()
    .isIn(LEAD_STATUS_ENUM)
    .withMessage(`Status must be one of: ${LEAD_STATUS_ENUM.join(', ')}`),
  validate,
];

const assignLeadValidation = [
  body('assignedTo')
    .trim()
    .notEmpty()
    .withMessage('AssignedTo user ID is required')
    .isMongoId()
    .withMessage('Invalid assignedTo user ID format'),
  validate,
];

const addNoteValidation = [
  body('note').trim().notEmpty().withMessage('Note text is required'),
  validate,
];

module.exports = {
  createLeadValidation,
  updateLeadValidation,
  assignLeadValidation,
  addNoteValidation,
};
