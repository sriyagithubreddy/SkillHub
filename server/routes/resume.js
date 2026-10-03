const express = require('express');
const { getResume, updateResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getResume);
router.put('/', updateResume);

module.exports = router;
