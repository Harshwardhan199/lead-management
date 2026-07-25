const { Lead } = require('../models/lead.model');
const LeadNote = require('../models/leadNote.model');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const { logActivity } = require('./leadActivity.service');

/**
 * Create a new lead
 */
const createLead = async (leadData, user) => {
  const lead = new Lead({
    ...leadData,
    createdBy: user.id,
  });

  const savedLead = await lead.save();

  await logActivity({
    leadId: savedLead._id,
    userId: user.id,
    action: 'Lead Created',
    metadata: {
      name: savedLead.name,
      email: savedLead.email,
      status: savedLead.status,
    },
  });

  return savedLead;
};

/**
 * Get paginated leads with filtering, search, and RBAC scoping
 */
const getLeads = async (queryParams, user) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  // RBAC: Member can view ONLY assigned leads
  if (user.role === 'member') {
    query.assignedTo = user.id;
  } else if (queryParams.assignedTo) {
    // Admin filtering by assignedTo
    query.assignedTo = queryParams.assignedTo;
  }

  // Filter by status if provided
  if (queryParams.status) {
    query.status = queryParams.status;
  }

  // Search filter across name, email, company
  if (queryParams.search) {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { company: searchRegex },
    ];
  }

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Lead.countDocuments(query),
  ]);

  return {
    leads,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get lead details by ID with access check
 */
const getLeadById = async (leadId, user) => {
  const lead = await Lead.findById(leadId)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');

  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  // RBAC Access check for member
  if (
    user.role === 'member' &&
    (!lead.assignedTo || lead.assignedTo._id.toString() !== user.id)
  ) {
    throw new ApiError(403, 'Forbidden: You do not have access to this lead');
  }

  const notes = await LeadNote.find({ lead: leadId })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });

  return { lead, notes };
};

/**
 * Update lead (Admin can update all; Member can only update status)
 */
const updateLead = async (leadId, updateData, user) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  // RBAC check for member
  if (
    user.role === 'member' &&
    (!lead.assignedTo || lead.assignedTo.toString() !== user.id)
  ) {
    throw new ApiError(403, 'Forbidden: You do not have access to this lead');
  }

  const previousStatus = lead.status;
  let isStatusChanged = false;

  if (user.role === 'member') {
    // Member is strictly allowed to update ONLY status
    if (updateData.status && updateData.status !== lead.status) {
      lead.status = updateData.status;
      isStatusChanged = true;
    }
  } else {
    // Admin can update any field
    if (updateData.status && updateData.status !== lead.status) {
      isStatusChanged = true;
    }
    Object.assign(lead, updateData);
  }

  const updatedLead = await lead.save();

  if (isStatusChanged) {
    await logActivity({
      leadId: updatedLead._id,
      userId: user.id,
      action: 'Status Changed',
      metadata: {
        previousStatus,
        newStatus: updatedLead.status,
      },
    });
  } else {
    await logActivity({
      leadId: updatedLead._id,
      userId: user.id,
      action: 'Lead Updated',
      metadata: { updateData },
    });
  }

  return updatedLead;
};

/**
 * Delete lead (Admin only)
 */
const deleteLead = async (leadId) => {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  await Lead.findByIdAndDelete(leadId);
  await LeadNote.deleteMany({ lead: leadId });

  return true;
};

/**
 * Assign or reassign lead (Admin only)
 */
const assignLead = async (leadId, assignedToUserId, user) => {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  const targetUser = await User.findById(assignedToUserId);
  if (!targetUser) {
    throw new ApiError(404, 'Assigned target user not found');
  }

  const previousAssignedTo = lead.assignedTo;
  lead.assignedTo = assignedToUserId;
  const updatedLead = await lead.save();

  await logActivity({
    leadId: updatedLead._id,
    userId: user.id,
    action: 'Lead Assigned',
    metadata: {
      previousAssignedTo,
      newAssignedTo: assignedToUserId,
      assignedToName: targetUser.name,
      assignedToEmail: targetUser.email,
    },
  });

  return updatedLead;
};

/**
 * Add note to a lead
 */
const addNote = async (leadId, noteText, user) => {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  // RBAC Access check for member
  if (
    user.role === 'member' &&
    (!lead.assignedTo || lead.assignedTo.toString() !== user.id)
  ) {
    throw new ApiError(403, 'Forbidden: You do not have access to this lead');
  }

  const noteDoc = new LeadNote({
    lead: leadId,
    user: user.id,
    note: noteText,
  });

  const savedNote = await noteDoc.save();

  await logActivity({
    leadId,
    userId: user.id,
    action: 'Note Added',
    metadata: {
      noteId: savedNote._id,
      preview: noteText.length > 50 ? `${noteText.substring(0, 50)}...` : noteText,
    },
  });

  return savedNote;
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  addNote,
};
