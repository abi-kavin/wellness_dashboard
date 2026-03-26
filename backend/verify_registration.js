const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const dotenv = require('dotenv');
dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const name = 'Test Faculty ' + Date.now();
        const email = 'test' + Date.now() + '@example.com';
        const password = 'password123';
        const department = 'CSE';
        
        console.log(`Creating faculty: ${name} (${email})`);
        const faculty = await Faculty.create({ name, department, email, password });
        console.log('Created!', faculty._id);
        
        const found = await Faculty.findById(faculty._id);
        console.log('Found in DB!', found.name);
        
        await Faculty.deleteOne({ _id: faculty._id });
        console.log('Cleaned up.');
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

test();
