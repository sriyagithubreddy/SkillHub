const SavedCourse = require('../models/SavedCourse');
const Course = require('../models/Course');
const User = require('../models/User');

// POST /api/saved-courses
const saveCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await SavedCourse.findOne({ userId: req.user._id, courseId });
    if (existing) return res.status(200).json({ savedCourse: existing, message: 'Already saved' });

    const savedCourse = await SavedCourse.create({ userId: req.user._id, courseId });
    res.status(201).json({ savedCourse });
  } catch (err) {
    next(err);
  }
};

// GET /api/saved-courses
const getSavedCourses = async (req, res, next) => {
  try {
    const { completed } = req.query;
    const filter = { userId: req.user._id };
    if (completed === 'true') filter.completed = true;
    if (completed === 'false') filter.completed = false;

    const savedCourses = await SavedCourse.find(filter).populate('courseId').sort({ savedAt: -1 });
    res.json({ savedCourses });
  } catch (err) {
    next(err);
  }
};

// PUT /api/saved-courses/:id  (update progress / mark completed)
const updateSavedCourse = async (req, res, next) => {
  try {
    const { progress, completed } = req.body;
    const savedCourse = await SavedCourse.findOne({ _id: req.params.id, userId: req.user._id }).populate('courseId');
    if (!savedCourse) return res.status(404).json({ message: 'Saved course not found' });

    if (progress !== undefined) savedCourse.progress = Math.max(0, Math.min(100, progress));
    if (completed !== undefined) {
      savedCourse.completed = completed;
      savedCourse.completedAt = completed ? new Date() : null;
      if (completed) savedCourse.progress = 100;
    }
    await savedCourse.save();

    // auto-add course skills to the user's skill list on completion (resume auto-population)
    if (completed && savedCourse.courseId) {
      const user = await User.findById(req.user._id);
      const existingNames = new Set(user.skills.map(s => s.name.toLowerCase()));
      savedCourse.courseId.skills.forEach(skillName => {
        if (!existingNames.has(skillName.toLowerCase())) {
          user.skills.push({ name: skillName, level: 'Beginner' });
          existingNames.add(skillName.toLowerCase());
        }
      });
      await user.save();
    }

    res.json({ savedCourse });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/saved-courses/:id
const removeSavedCourse = async (req, res, next) => {
  try {
    const savedCourse = await SavedCourse.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!savedCourse) return res.status(404).json({ message: 'Saved course not found' });
    res.json({ message: 'Removed from saved courses' });
  } catch (err) {
    next(err);
  }
};

module.exports = { saveCourse, getSavedCourses, updateSavedCourse, removeSavedCourse };
