const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const dotenv = require('dotenv');

dotenv.config();

const createKarthi = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'karthistaff@gmail.com';

        // Remove existing if any
        await Faculty.deleteOne({ email });

        const karthi = await Faculty.create({
            name: 'Karthi Staff',
            department: 'CSE',
            email: email,
            password: 'karthi123'
        });

        console.log(`Created Faculty: ${karthi.name} with password: karthi123`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createKarthi();
