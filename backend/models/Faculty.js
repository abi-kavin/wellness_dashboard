const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const FacultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, enum: ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL'], required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

FacultySchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

FacultySchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Faculty', FacultySchema);
