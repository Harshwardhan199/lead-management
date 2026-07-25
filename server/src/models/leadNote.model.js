const mongoose = require('mongoose');

const leadNoteSchema = new mongoose.Schema(
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
    note: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const LeadNote = mongoose.model('LeadNote', leadNoteSchema);

module.exports = LeadNote;
