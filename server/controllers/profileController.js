const User = require('../models/User');
const SavedCourse = require('../models/SavedCourse');
const Certificate = require('../models/Certificate');

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const [savedCourses, certificates] = await Promise.all([
      SavedCourse.find({ userId: req.user._id }).populate('courseId'),
      Certificate.find({ userId: req.user._id })
    ]);

    const completed = savedCourses.filter(s => s.completed);

    res.json({
      user: req.user.toSafeObject(),
      stats: {
        coursesSaved: savedCourses.length,
        coursesCompleted: completed.length,
        certificates: certificates.length,
        skills: req.user.skills.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowed = [
      'name', 'phone', 'location', 'linkedin', 'github', 'portfolio', 'photoUrl',
      'summary', 'interests', 'education', 'skills', 'isPublicProfile', 'username',
      'achievements', 'extraActivities'
    ];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// GET /api/portfolio/:username  (public - no private info)
const getPublicPortfolio = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username, isPublicProfile: true });
    if (!user) return res.status(404).json({ message: 'Public profile not found' });

    const [savedCourses, certificates] = await Promise.all([
      SavedCourse.find({ userId: user._id, completed: true }).populate('courseId'),
      Certificate.find({ userId: user._id })
    ]);

    res.json({
      name: user.name,
      photoUrl: user.photoUrl,
      summary: user.summary,
      skills: user.skills,
      education: user.education,
      achievements: user.achievements,
      portfolio: user.portfolio,
      github: user.github,
      linkedin: user.linkedin,
      completedCourses: savedCourses.map(s => s.courseId?.title).filter(Boolean),
      certificates: certificates.map(c => ({ name: c.name, organization: c.organization }))
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getPublicPortfolio };
