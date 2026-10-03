const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    portfolio: String
  },
  summary: String,
  education: [{
    degree: String,
    college: String,
    branch: String,
    cgpa: String,
    startYear: String,
    endYear: String
  }],
  skills: [{
    name: String,
    level: String
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    link: String
  }],
  certifications: [{
    name: String,
    organization: String,
    issueDate: Date,
    credentialUrl: String
  }],
  experience: [{
    organization: String,
    role: String,
    duration: String,
    description: String
  }],
  achievements: [String],
  extraActivities: [String],
  template: { type: String, enum: ['simple-ats', 'modern-professional', 'minimal-student'], default: 'simple-ats' }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
