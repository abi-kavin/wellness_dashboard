const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

const calculateRisk = (attendance, marks, stressLevel) => {
    let risk = 'Low';
    if (marks < 50 || stressLevel === 'High') risk = 'High';
    else if (attendance < 75) risk = 'Medium';
    return risk;
};

const createStudent = async (req, res) => {
    const { name, registerNumber, department, email, password, attendance, marks, stressLevel } = req.body;
    const facultyId = req.user._id;
    const facultyDept = req.user.department;

    try {
        // Check department match
        if (department !== facultyDept) {
            return res.status(400).json({ message: `You can only create students for your department (${facultyDept})` });
        }

        const studentExists = await Student.findOne({ email });
        if (studentExists) return res.status(400).json({ message: 'Student already exists' });

        const riskLevel = calculateRisk(attendance, marks, stressLevel);

        const student = await Student.create({
            name, registerNumber, department, email, password, attendance, marks, stressLevel, riskLevel, facultyId
        });

        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const loginStudent = async (req, res) => {
    const { email, password } = req.body;

    try {
        const student = await Student.findOne({ email });
        if (student && (await student.comparePassword(password))) {
            res.json({
                _id: student._id,
                name: student.name,
                email: student.email,
                token: generateToken(student._id),
                role: 'student',
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const getStudents = async (req, res) => {
    try {
        // Ensure faculty only sees their own department/created students
        const students = await Student.find({ facultyId: req.user._id });
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Authorization: Student can only see their own profile
        // Faculty can only see students they created
        const isOwner = student.facultyId.toString() === req.user._id.toString();
        const isSelf = student._id.toString() === req.user._id.toString();

        if (isOwner || isSelf) {
            res.json(student);
        } else {
            res.status(403).json({ message: 'Not authorized to view this data' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const { name, registerNumber, department, email, attendance, marks, stressLevel } = req.body;
        student.name = name || student.name;
        student.registerNumber = registerNumber || student.registerNumber;
        student.department = department || student.department;
        student.email = email || student.email;
        student.attendance = attendance !== undefined ? attendance : student.attendance;
        student.marks = marks !== undefined ? marks : student.marks;
        student.stressLevel = stressLevel || student.stressLevel;
        student.riskLevel = calculateRisk(student.attendance, student.marks, student.stressLevel);

        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            await student.deleteOne();
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { createStudent, loginStudent, getStudents, getStudentById, updateStudent, deleteStudent };
