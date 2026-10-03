const express = require('express');
const { saveCourse, getSavedCourses, updateSavedCourse, removeSavedCourse } = require('../controllers/savedCourseController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.post('/', saveCourse);
router.get('/', getSavedCourses);
router.put('/:id', updateSavedCourse);
router.delete('/:id', removeSavedCourse);

module.exports = router;
