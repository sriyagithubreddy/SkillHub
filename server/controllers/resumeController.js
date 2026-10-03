const Resume = require('../models/Resume');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

// GET /api/resume  - returns saved resume merged with fresh auto-populate suggestions
const getResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      resume = await Resume.create({ userId: req.user._id, personalInfo: { fullName: req.user.name, email: req.user.email } });
    }

    const certificates = await Certificate.find({ userId: req.user._id, addToResume: true });

    res.json({
      resume,
      autoPopulate: {
        skills: req.user.skills,
        certifications: certificates.map(c => ({
          name: c.name, organization: c.organization, issueDate: c.issueDate, credentialUrl: c.credentialUrl
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/resume
const updateResume = async (req, res, next) => {
  try {
    const allowed = ['personalInfo', 'summary', 'education', 'skills', 'projects', 'certifications', 'experience', 'achievements', 'extraActivities', 'template'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id }, updates, { new: true, upsert: true, runValidators: true }
    );
    res.json({ resume });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResume, updateResume };
