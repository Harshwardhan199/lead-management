const mongoose = require('mongoose');

const LEAD_STATUS_ENUM = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Won',
  'Lost',
];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Lead phone number is required'],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: LEAD_STATUS_ENUM,
        message: 'Status must be one of: New, Contacted, Qualified, Proposal Sent, Won, Lost',
      },
      default: 'New',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search support
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = {
  Lead,
  LEAD_STATUS_ENUM,
};
