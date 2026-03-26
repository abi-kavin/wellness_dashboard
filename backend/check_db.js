const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const dotenv = require('dotenv');
dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const faculties = await Faculty.find();
        console.log('Faculties in DB:', faculties.length);
        faculties.forEach(f => console.log(`- ${f.name} (${f.email}) - ${f.department}`));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

test();
