const leadService = require('../services/lead.service');
const leadActivityService = require('../services/leadActivity.service');
const { sendSuccess } = require('../utils/response.utils');

/**
 * POST /api/leads - Create lead (Admin only)
 */
const createLead = async (req, res, next) => {
  try {
    const lead = await leadService.createLead(req.body, req.user);
    return sendSuccess(res, 201, 'Lead created successfully', lead);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads - List leads with pagination, filters, search
 */
const getLeads = async (req, res, next) => {
  try {
    const result = await leadService.getLeads(req.query, req.user);
    return sendSuccess(res, 200, 'Leads retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/:id - Get single lead details with notes
 */
const getLeadById = async (req, res, next) => {
  try {
    const result = await leadService.getLeadById(req.params.id, req.user);
    return sendSuccess(res, 200, 'Lead details retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/leads/:id - Update lead details
 */
const updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, 'Lead updated successfully', lead);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/leads/:id - Delete lead (Admin only)
 */
const deleteLead = async (req, res, next) => {
  try {
    await leadService.deleteLead(req.params.id);
    return sendSuccess(res, 200, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/leads/:id/assign - Assign or reassign lead (Admin only)
 */
const assignLead = async (req, res, next) => {
  try {
    const lead = await leadService.assignLead(
      req.params.id,
      req.body.assignedTo,
      req.user
    );
    return sendSuccess(res, 200, 'Lead assigned successfully', lead);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/leads/:id/notes - Add note to lead
 */
const addNote = async (req, res, next) => {
  try {
    const note = await leadService.addNote(
      req.params.id,
      req.body.note,
      req.user
    );
    return sendSuccess(res, 201, 'Note added successfully', note);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/:id/activity - Get activity history log for a lead
 */
const getLeadActivities = async (req, res, next) => {
  try {
    // First ensure the lead exists and user has access
    await leadService.getLeadById(req.params.id, req.user);
    const activities = await leadActivityService.getLeadActivities(req.params.id);
    return sendSuccess(res, 200, 'Lead activities retrieved successfully', activities);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  addNote,
  getLeadActivities,
};
