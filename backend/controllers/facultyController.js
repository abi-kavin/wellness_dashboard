const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');

const registerFaculty = async (req, res) => {
    const { name, department, email, password } = req.body;

    try {
        const facultyExists = await Faculty.findOne({ email });
        if (facultyExists) return res.status(400).json({ message: 'Faculty already exists' });

        const faculty = await Faculty.create({ name, department, email, password });
        if (faculty) {
            res.status(201).json({
                _id: faculty._id,
                name: faculty.name,
                department: faculty.department,
                email: faculty.email,
                token: generateToken(faculty._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid faculty data' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const loginFaculty = async (req, res) => {
    const { email, password } = req.body;

    try {
        const faculty = await Faculty.findOne({ email });
        if (faculty && (await faculty.comparePassword(password))) {
            res.json({
                _id: faculty._id,
                name: faculty.name,
                department: faculty.department,
                email: faculty.email,
                token: generateToken(faculty._id),
                role: 'faculty',
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { registerFaculty, loginFaculty };
