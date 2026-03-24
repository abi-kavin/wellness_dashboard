const express = require('express');
const router = express.Router();
const { analyzePlatform, handleQuery } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analyze', protect, analyzePlatform);
router.post('/query', protect, handleQuery);

module.exports = router;
