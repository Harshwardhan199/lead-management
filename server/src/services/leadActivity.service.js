const { LeadActivity } = require('../models/leadActivity.model');

/**
 * Log an activity event for a lead
 * @param {Object} param0
 * @param {string} param0.leadId
 * @param {string} param0.userId
 * @param {string} param0.action
 * @param {Object} [param0.metadata]
 */
const logActivity = async ({ leadId, userId, action, metadata = {} }) => {
  const activity = new LeadActivity({
    lead: leadId,
    user: userId,
    action,
    metadata,
  });
  return await activity.save();
};

/**
 * Get all activities for a lead sorted by newest first
 * @param {string} leadId
 */
const getLeadActivities = async (leadId) => {
  return await LeadActivity.find({ lead: leadId })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });
};

module.exports = {
  logActivity,
  getLeadActivities,
};
