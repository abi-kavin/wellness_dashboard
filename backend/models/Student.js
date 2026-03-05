const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registerNumber: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    attendance: { type: Number, default: 0 },
    marks: { type: Number, default: 0 },
    stressLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true }
}, { timestamps: true });

StudentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

StudentSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);
