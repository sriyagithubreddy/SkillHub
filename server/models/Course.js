const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  platform: {
    type: String,
    enum: [
  'YouTube',
  'SWAYAM',
  'Microsoft Learn',
  'freeCodeCamp',
],
    required: true
  },

  instructor: String,

  category: {
    type: String,
    required: true,
    enum: [
      'Data Science',
      'Artificial Intelligence',
      'Machine Learning',
      'Web Development',
      'App Development',
      'Cyber Security',
      'Cloud Computing',
      'Programming',
      'Database',
      'UI/UX',
      'Business',
      'Communication'
    ]
  },

  skills: {
    type: [String],
    default: []
  },

  level: {
    type: String,
    enum: [
      'Beginner',
      'Intermediate',
      'Advanced'
    ],
    required: true
  },

  durationHours: {
    type: Number,
    required: true
  },

  url: {
    type: String,
    required: true
  },

  thumbnail: String,

  // SkillHub contains free learning resources only.
  // The controller/importers enforce free: true.
  free: {
    type: Boolean,
    default: true
  },

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },

  popularity: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: [
      'active',
      'broken',
      'redirected',
      'unavailable'
    ],
    default: 'active'
  },

  lastChecked: {
    type: Date,
    default: Date.now
  },

  source: {
    type: String,
    enum: [
      'seed',
      'admin',
      'external_api'
    ],
    default: 'seed'
  }

}, {
  timestamps: true
});

courseSchema.index({
  title: 'text',
  skills: 'text',
  description: 'text'
});

module.exports = mongoose.model(
  'Course',
  courseSchema
);