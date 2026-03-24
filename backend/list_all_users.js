const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');
const dotenv = require('dotenv');

dotenv.config();

const listAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const faculties = await Faculty.find({});
        console.log('--- Faculties ---');
        faculties.forEach(f => console.log(`- ${f.name} (${f.email})`));

        const students = await Student.find({});
        console.log('\n--- Students ---');
        students.forEach(s => console.log(`- ${s.name} (${s.email})`));

        console.log('\n-----------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listAll();
