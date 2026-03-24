const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const dotenv = require('dotenv');

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const faculties = await Faculty.find({});
        console.log('--- Faculties in DB ---');
        faculties.forEach(f => {
            console.log(`- ${f.name} (${f.email}) [dept: ${f.department}]`);
        });
        console.log('-----------------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listUsers();
