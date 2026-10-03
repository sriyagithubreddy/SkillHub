const Course = require('../models/Course');
const User = require('../models/User');
const SavedCourse = require('../models/SavedCourse');

const getStats = async (req, res, next) => {
  try {
    const [totalCourses, activeCourses, brokenLinks, registeredStudents, completedCourses] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ status: 'active' }),
      Course.countDocuments({ status: { $in: ['broken', 'unavailable'] } }),
      User.countDocuments({ role: 'student' }),
      SavedCourse.countDocuments({ completed: true })
    ]);
    res.json({ totalCourses, activeCourses, brokenLinks, registeredStudents, completedCourses });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name email role username createdAt isPublicProfile')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

const getBrokenLinks = async (req, res, next) => {
  try {
    const courses = await Course.find({ status: { $in: ['broken', 'unavailable', 'redirected'] } });
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getUsers, getBrokenLinks };
