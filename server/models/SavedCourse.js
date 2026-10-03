const mongoose = require('mongoose');

const savedCourseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: Date,
  savedAt: { type: Date, default: Date.now }
}, { timestamps: true });

savedCourseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('SavedCourse', savedCourseSchema);
