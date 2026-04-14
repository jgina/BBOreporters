const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAdminStats } = require('../controllers/adminController');
const router = express.Router();

router.get('/stats', protect, adminOnly, getAdminStats);

module.exports = router;
