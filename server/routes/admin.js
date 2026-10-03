const express = require('express');
const { getStats, getUsers, getBrokenLinks } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/courses/broken', getBrokenLinks);

module.exports = router;
