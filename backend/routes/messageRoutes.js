const express = require('express');
const { sendMessage, getStudentMessages, getUnreadCount, markAsRead, getMessagesByFaculty, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/student', protect, getStudentMessages);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-read', protect, markAsRead);
router.get('/faculty/:studentId', protect, getMessagesByFaculty);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
