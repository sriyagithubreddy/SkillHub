const Course = require('../models/Course');
const SavedCourse = require('../models/SavedCourse');

// GET /api/courses
// Search + filter + sort + pagination
const getCourses = async (req, res, next) => {
  try {
    const {
      q,
      platform,
      category,
      level,
      minDuration,
      maxDuration,
      sort = 'relevance',
      page = 1,
      limit = 12,
      userId
    } = req.query;

    const filter = {
      // SkillHub is a free-only learning platform.
      free: true,
      status: { $ne: 'unavailable' }
    };

    if (platform) filter.platform = platform;
    if (category) filter.category = category;
    if (level) filter.level = level;

    if (minDuration || maxDuration) {
      filter.durationHours = {};

      if (minDuration) {
        filter.durationHours.$gte = Number(minDuration);
      }

      if (maxDuration) {
        filter.durationHours.$lte = Number(maxDuration);
      }
    }

    let query;

    if (q) {
      filter.$text = { $search: q };

      query = Course.find(
        filter,
        { score: { $meta: 'textScore' } }
      );
    } else {
      query = Course.find(filter);
    }

    const sortMap = {
      relevance: q
        ? { score: { $meta: 'textScore' } }
        : { popularity: -1 },

      duration: { durationHours: 1 },

      newest: { createdAt: -1 },

      popular: { popularity: -1 }
    };

    query = query.sort(
      sortMap[sort] || sortMap.relevance
    );

    const skip =
      (Number(page) - 1) * Number(limit);

    const [courses, total] = await Promise.all([
      query
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Course.countDocuments(filter)
    ]);

    let savedMap = {};

    if (userId) {
      const saved = await SavedCourse
        .find({ userId })
        .lean();

      savedMap = saved.reduce((acc, s) => {
        acc[s.courseId.toString()] = {
          saved: true,
          completed: s.completed,
          progress: s.progress
        };

        return acc;
      }, {});
    }

    const withState = courses.map(course => ({
      ...course,
      saveState:
        savedMap[course._id.toString()] || null
    }));

    res.json({
      courses: withState,
      total,
      page: Number(page),
      pages: Math.ceil(
        total / Number(limit)
      )
    });
  } catch (err) {
    next(err);
  }
};


// GET /api/courses/:id
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course
      .findOne({
        _id: req.params.id,
        free: true,
        status: { $ne: 'unavailable' }
      })
      .lean();

    if (!course) {
      return res.status(404).json({
        message: 'Free course not found'
      });
    }

    const related = await Course
      .find({
        _id: { $ne: course._id },
        category: course.category,
        free: true,
        status: { $ne: 'unavailable' }
      })
      .limit(4)
      .lean();

    res.json({
      course,
      related
    });
  } catch (err) {
    next(err);
  }
};


// POST /api/courses
// Admin-created courses are ALWAYS free.
const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create({
      ...req.body,

      // SkillHub is free-only.
      free: true,

      source: 'admin'
    });

    res.status(201).json({
      course
    });
  } catch (err) {
    next(err);
  }
};


// PUT /api/courses/:id
// Course updates can NEVER change a course to paid.
const updateCourse = async (req, res, next) => {
  try {
    const updates = {
      ...req.body,

      // Always enforce free-only.
      free: true
    };

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    res.json({
      course
    });
  } catch (err) {
    next(err);
  }
};


// DELETE /api/courses/:id
// Soft delete via status.
const deleteCourse = async (req, res, next) => {
  try {
    const { hard } = req.query;

    if (hard === 'true') {
      const course = await Course.findByIdAndDelete(
        req.params.id
      );

      if (!course) {
        return res.status(404).json({
          message: 'Course not found'
        });
      }

      return res.json({
        message: 'Course permanently deleted'
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        status: 'unavailable'
      },
      {
        new: true
      }
    );

    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    res.json({
      message: 'Course marked unavailable',
      course
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
