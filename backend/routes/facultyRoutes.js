const express = require('express');
const { registerFaculty, loginFaculty } = require('../controllers/facultyController');
const router = express.Router();

router.post('/register', registerFaculty);
router.post('/login', loginFaculty);

module.exports = router;
