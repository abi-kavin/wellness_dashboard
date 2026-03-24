const express = require('express');
const { createStudent, loginStudent, getStudents, getStudentById, updateStudent, deleteStudent, resetStudentPassword } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', loginStudent);
router.post('/create', protect, createStudent);
router.get('/', protect, getStudents);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, updateStudent);
router.put('/:id/reset-password', protect, resetStudentPassword);
router.delete('/:id', protect, deleteStudent);

module.exports = router;
