const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'login_test_' + Date.now() + '@example.com';
        const password = 'password123';
        
        console.log('Registering...');
        const faculty = await Faculty.create({
            name: 'Login Test',
            department: 'CSE',
            email: email,
            password: password
        });
        console.log('Registered with ID:', faculty._id);
        
        console.log('Attempting Login...');
        const foundFaculty = await Faculty.findOne({ email });
        if (!foundFaculty) throw new Error('Faculty not found after registration!');
        
        const isMatch = await foundFaculty.comparePassword(password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) throw new Error('Password mismatch!');
        
        console.log('SUCCESS: Registration and Login flow verified.');
        
        await Faculty.deleteOne({ _id: faculty._id });
        process.exit(0);
    } catch (err) {
        console.error('FAIL:', err.message);
        process.exit(1);
    }
};

test();
