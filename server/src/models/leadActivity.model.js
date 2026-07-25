const mongoose = require('mongoose');

const LEAD_ACTIONS = [
  'Lead Created',
  'Lead Assigned',
  'Status Changed',
  'Note Added',
  'Lead Updated',
  'Lead Deleted',
];

const leadActivitySchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    action: {
      type: String,
      enum: {
        values: LEAD_ACTIONS,
        message: 'Action must be a valid lead activity type',
      },
      required: [true, 'Activity action is required'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const LeadActivity = mongoose.model('LeadActivity', leadActivitySchema);

module.exports = {
  LeadActivity,
  LEAD_ACTIONS,
};
