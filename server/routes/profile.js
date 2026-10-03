const express = require('express');
const { getProfile, updateProfile, getPublicPortfolio } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);

module.exports = router;
