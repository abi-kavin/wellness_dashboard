const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const dotenv = require('dotenv');

dotenv.config();

const checkFaculty = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'karthistaff@gmail.com';
        const faculty = await Faculty.findOne({ email });

        if (faculty) {
            console.log(`Faculty found: ${faculty.name}`);
            console.log(`Pass: ${faculty.password}`);
            // Check if password matches a common one (e.g. karthi123)
            const matches = await faculty.comparePassword('karthi123');
            console.log(`Password 'karthi123' matches? ${matches}`);
        } else {
            console.log('Faculty NOT found');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkFaculty();
