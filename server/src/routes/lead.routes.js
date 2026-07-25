const express = require('express');
const leadController = require('../controllers/lead.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const {
  createLeadValidation,
  updateLeadValidation,
  assignLeadValidation,
  addNoteValidation,
} = require('../validators/lead.validator');

const router = express.Router();

// All lead routes require authentication
router.use(authenticate);

// Admin-only lead creation
router.post('/', authorize('admin'), createLeadValidation, leadController.createLead);

// List leads with pagination, filtering & search (Admin views all; Member views assigned)
router.get('/', authorize('admin', 'member'), leadController.getLeads);

// Single lead details
router.get('/:id', authorize('admin', 'member'), leadController.getLeadById);

// Update lead (Admin updates all fields; Member updates status only)
router.patch('/:id', authorize('admin', 'member'), updateLeadValidation, leadController.updateLead);

// Delete lead (Admin only)
router.delete('/:id', authorize('admin'), leadController.deleteLead);

// Assign lead (Admin only)
router.patch('/:id/assign', authorize('admin'), assignLeadValidation, leadController.assignLead);

// Add note to lead (Admin or assigned Member)
router.post('/:id/notes', authorize('admin', 'member'), addNoteValidation, leadController.addNote);

// Get activity history log for lead (Admin or assigned Member)
router.get('/:id/activity', authorize('admin', 'member'), leadController.getLeadActivities);

module.exports = router;
