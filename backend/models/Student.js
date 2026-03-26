const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const StudentSchema = new mongoose.Schema({
    // ── Identity ──
    name: { type: String, required: true },
    registerNumber: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },

    // ── Academic Metrics ──
    attendance: { type: Number, default: 0, min: 0, max: 100 },
    cgpa: { type: Number, default: 0, min: 0, max: 10 },
    marks: { type: Number, default: 0, min: 0, max: 100 },  // kept for legacy display
    backlogs: { type: Number, default: 0, min: 0 },

    // ── Engagement Metrics ──
    classParticipation: { type: String, enum: ['Poor', 'Average', 'Good', 'Excellent'], default: 'Average' },
    sportsParticipation: { type: String, enum: ['None', 'Occasional', 'Regular'], default: 'None' },
    competitionParticipation: { type: String, enum: ['None', 'Occasional', 'Regular'], default: 'None' },

    // ── Wellness Metrics ──
    stressLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    sleepHours: { type: Number, default: 7, min: 0, max: 24 },
    disciplinaryIssues: { type: Number, default: 0, min: 0 },

    // ── Faculty Input ──
    facultyRemarks: { type: String, default: '' },

    // ── Computed Fields ──
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    riskScore: { type: Number, default: 0 },

}, { timestamps: true });

StudentSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

StudentSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);
