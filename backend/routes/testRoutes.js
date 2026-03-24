const express = require('express');
const router = express.Router();

router.get('/check-env', (req, res) => {
    res.json({
        hasKey: !!process.env.GEMINI_API_KEY,
        keyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : 'none'
    });
});

module.exports = router;
