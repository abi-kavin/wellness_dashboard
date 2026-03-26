const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const sampleStudents = [
    {
        name: "Abhishek Kumar",
        registerNumber: "2021CSE001",
        department: "CSE",
        email: "abhishek@inst.edu",
        password: "password123",
        attendance: 85,
        cgpa: 8.4,
        backlogs: 0,
        riskLevel: "Low",
        riskScore: 12
    },
    {
        name: "Riya Sharma",
        registerNumber: "2021CSE042",
        department: "CSE",
        email: "riya@inst.edu",
        password: "password123",
        attendance: 62,
        cgpa: 5.8,
        backlogs: 2,
        riskLevel: "High",
        riskScore: 82
    },
    {
        name: "Vikram Singh",
        registerNumber: "2021CSE105",
        department: "CSE",
        email: "vikram@inst.edu",
        password: "password123",
        attendance: 74,
        cgpa: 7.1,
        backlogs: 1,
        riskLevel: "Medium",
        riskScore: 45
    },
    {
        name: "Anjali Gupta",
        registerNumber: "2021CSE015",
        department: "CSE",
        email: "anjali@inst.edu",
        password: "password123",
        attendance: 92,
        cgpa: 9.1,
        backlogs: 0,
        riskLevel: "Low",
        riskScore: 5
    }
];

const seed = async () => {
    try {
        console.log(`Connecting to: ${MONGO_URI}`);
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const email = 'karthistaff@gmail.com';
        const password = 'Karthi@123';

        // 1. Handle Faculty
        await Faculty.deleteMany({ email });
        const faculty = await Faculty.create({
            name: 'Karthika Staff',
            department: 'CSE',
            email: email,
            password: password
        });

        // 2. Handle Students
        await Student.deleteMany({ facultyId: faculty._id });
        const studentsToCreate = sampleStudents.map(s => ({ ...s, facultyId: faculty._id }));
        await Student.create(studentsToCreate);

        console.log(`\n========================================`);
        console.log(`FACULTY & STUDENT DATA SEEDED SUCCESSFULLY`);
        console.log(`Faculty Email: ${faculty.email}`);
        console.log(`Faculty Password: ${password}`);
        console.log(`Sample Students Added: ${studentsToCreate.length}`);
        console.log(`========================================\n`);
        
        process.exit(0);
    } catch (err) {
        console.error('Seeding Failed:', err.message);
        process.exit(1);
    }
};

seed();
