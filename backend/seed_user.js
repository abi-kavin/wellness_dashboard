const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = 'mongodb://127.0.0.1:27017/wellness_dashboard';

const seed = async () => {
    try {
        console.log(`Trying to connect to: ${MONGO_URI}`);
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });
        console.log('Connected.');

        const email = 'karthistaff@gmail.com';
        const password = 'karthi123';

        await Faculty.deleteMany({ email });
        console.log('Deleted existing users with that email.');

        const faculty = await Faculty.create({
            name: 'Karthika Staff',
            department: 'CSE',
            email: email,
            password: password
        });

        console.log(`REGISTERED SUCCESS: ${faculty.email} with karthi123`);
        process.exit(0);
    } catch (err) {
        console.error('Connection Failed:', err.message);
        process.exit(1);
    }
};

seed();
