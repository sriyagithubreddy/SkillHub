const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  organization: { type: String, required: true },
  course: String,
  issueDate: { type: Date, required: true },
  credentialId: String,
  credentialUrl: String,
  addToResume: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
