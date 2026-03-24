const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

/* ═══════════════════════════════════════════════════════════════════
   CASCADING STUDENT ANALYSIS ENGINE
   Pipeline:
     Step 1 — Academic Core   : attendance -> CGPA -> backlogs
     Step 2 — Engagement      : class participation -> sports -> competitions
     Step 3 — Wellness        : sleep -> disciplinary issues
     Step 4 — Stress Synthesis: derived from Steps 1+3 signals
     Step 5 — Remarks Scan    : faculty keyword analysis
     Step 6 — Risk Score+Level: Low (0-39) | Medium (40-64) | High (65+)
═══════════════════════════════════════════════════════════════════ */
const analyzeStudent = (data) => {
    const att = Number(data.attendance) || 0;
    const cgpa = Number(data.cgpa) || 0;
    const bl = Number(data.backlogs) || 0;
    const sleep = Number(data.sleepHours) || 7;
    const disc = Number(data.disciplinaryIssues) || 0;
    const cp = data.classParticipation || 'Average';
    const sp = data.sportsParticipation || 'None';
    const comp = data.competitionParticipation || 'None';

    /* ── STEP 1: Academic Core (max 60 pts) ── */
    const attendancePoints = att < 50 ? 20 : att < 65 ? 15 : att < 75 ? 10 : att < 85 ? 4 : 0;
    const cgpaPoints = cgpa < 4 ? 20 : cgpa < 5 ? 15 : cgpa < 6 ? 10 : cgpa < 7 ? 4 : 0;
    const backlogPoints = bl >= 5 ? 20 : bl >= 3 ? 14 : bl >= 1 ? 7 : 0;
    const academicScore = attendancePoints + cgpaPoints + backlogPoints;

    /* ── STEP 2: Engagement (max 16 pts) ── */
    const cpPoints = cp === 'Poor' ? 8 : cp === 'Average' ? 4 : cp === 'Good' ? 1 : 0;
    const spPoints = sp === 'None' ? 4 : sp === 'Occasional' ? 1 : 0;
    const compPoints = comp === 'None' ? 4 : comp === 'Occasional' ? 1 : 0;
    const engagementScore = cpPoints + spPoints + compPoints;

    /* ── STEP 3: Wellness (max 22 pts) ── */
    const sleepPoints = (sleep < 4 || sleep > 12) ? 8 : (sleep < 6 || sleep > 10) ? 4 : (sleep < 7 || sleep > 9) ? 1 : 0;
    const discPoints = disc >= 3 ? 14 : disc === 2 ? 8 : disc === 1 ? 4 : 0;
    const wellnessScore = sleepPoints + discPoints;

    /* ── STEP 4: Stress Synthesis ──────────────────────────────────────
       CGPA and Attendance are the PRIMARY stress drivers.
       Each is scored independently on a 5-level scale (0-10 pts).
       Additional wellness signals then amplify the total.
    ────────────────────────────────────────────────────────────────── */
    let stressPoints = 0;

    // CGPA stress contribution (0-10 pts) — fine-grained 5 levels
    if (cgpa === 0) stressPoints += 0;  // not entered
    else if (cgpa < 4) stressPoints += 10; // critical — failing grade
    else if (cgpa < 5) stressPoints += 7;  // very low
    else if (cgpa < 6) stressPoints += 4;  // below average
    else if (cgpa < 7) stressPoints += 2;  // borderline
    else if (cgpa < 8) stressPoints += 1;  // acceptable
    // >= 8 → 0 (healthy CGPA, no stress contribution)

    // Attendance stress contribution (0-10 pts) — fine-grained 5 levels
    if (att < 40) stressPoints += 10; // dangerously low
    else if (att < 55) stressPoints += 7;  // very low
    else if (att < 65) stressPoints += 5;  // significantly below threshold
    else if (att < 75) stressPoints += 3;  // below 75% cut-off
    else if (att < 85) stressPoints += 1;  // borderline safe
    // >= 85 → 0 (good attendance, no stress contribution)

    // Compound Academic Risk: when BOTH cgpa AND attendance are low, stress compounds
    if (cgpa < 6 && att < 75) stressPoints += 3;
    if (cgpa < 5 && att < 65) stressPoints += 3; // double penalty for severe dual failure

    // Backlogs add pressure on top of academic stress
    if (bl >= 5) stressPoints += 4;
    else if (bl >= 3) stressPoints += 2;
    else if (bl >= 1) stressPoints += 1;

    // Wellness amplifiers
    if (sleep < 5 || sleep > 11) stressPoints += 3; // severe sleep disruption
    else if (sleep < 6 || sleep > 10) stressPoints += 1;
    if (disc >= 2) stressPoints += 2;
    if (cp === 'Poor' && sp === 'None') stressPoints += 1; // social isolation

    // Stress thresholds: scaled to new max (~36 pts when all factors are critical)
    const stressLevel = stressPoints >= 14 ? 'High' : stressPoints >= 6 ? 'Medium' : 'Low';
    const stressRiskPts = stressLevel === 'High' ? 10 : stressLevel === 'Medium' ? 5 : 0;

    /* ── STEP 5: Faculty Remarks keyword scan (max 8, min -4) ── */
    const remarks = (data.facultyRemarks || '').toLowerCase();
    const neg = ['concern', 'absent', 'poor', 'fail', 'struggle', 'disrupt', 'warn', 'lazy', 'irresponsible', 'missing'];
    const pos = ['excellent', 'outstanding', 'improve', 'great', 'diligent', 'committed', 'responsible'];
    const remarkPoints = Math.min(8, neg.filter(k => remarks.includes(k)).length * 3)
        - Math.min(4, pos.filter(k => remarks.includes(k)).length * 2);

    /* ── STEP 6: Final Risk Score + Level ── */
    const raw = academicScore + engagementScore + wellnessScore + stressRiskPts + remarkPoints;
    const riskScore = Math.max(0, Math.min(100, Math.round(raw)));
    const riskLevel = riskScore >= 65 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';

    return { riskScore, riskLevel, stressLevel };
};

/* ═══════════════════════════
   EXTRACT ALL FIELDS
═══════════════════════════ */
const extractFields = (body) => {
    const {
        name, registerNumber, department, email, password,
        attendance, cgpa, marks, backlogs,
        classParticipation, sportsParticipation, competitionParticipation,
        sleepHours, disciplinaryIssues, facultyRemarks
    } = body;
    return {
        name, registerNumber, department, email, password,
        attendance, cgpa, marks, backlogs,
        classParticipation, sportsParticipation, competitionParticipation,
        sleepHours, disciplinaryIssues, facultyRemarks
    };
};

/* ═══════════════════════════
   CREATE STUDENT
═══════════════════════════ */
const createStudent = async (req, res) => {
    const fields = extractFields(req.body);
    const facultyId = req.user._id;
    const facultyDept = req.user.department;

    try {
        const studentCount = await Student.countDocuments({ facultyId });
        if (studentCount >= 150) {
            return res.status(400).json({ message: 'Student limit of 150 reached for this department.' });
        }

        if (fields.department !== facultyDept) {
            return res.status(400).json({ message: `You can only create students for your department (${facultyDept})` });
        }

        const existing = await Student.findOne({
            $or: [{ email: fields.email }, { registerNumber: fields.registerNumber }]
        });
        if (existing) {
            if (existing.email === fields.email) return res.status(400).json({ message: 'Student email already exists' });
            return res.status(400).json({ message: 'Register number already exists' });
        }

        const { riskScore, riskLevel, stressLevel } = analyzeStudent(fields);

        const student = await Student.create({ ...fields, stressLevel, riskScore, riskLevel, facultyId });
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

/* ═══════════════════════════
   LOGIN STUDENT
═══════════════════════════ */
const loginStudent = async (req, res) => {
    const { email, password } = req.body;
    try {
        const student = await Student.findOne({ email });
        if (student && (await student.comparePassword(password))) {
            res.json({
                _id: student._id,
                name: student.name,
                email: student.email,
                token: generateToken(student._id),
                role: 'student',
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

/* ═══════════════════════════
   GET STUDENTS (faculty's)
═══════════════════════════ */
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({ facultyId: req.user._id });
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

/* ═══════════════════════════
   GET STUDENT BY ID
═══════════════════════════ */
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const isOwner = student.facultyId.toString() === req.user._id.toString();
        const isSelf = student._id.toString() === req.user._id.toString();

        if (isOwner || isSelf) {
            res.json(student);
        } else {
            res.status(403).json({ message: 'Not authorized to view this data' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

/* ═══════════════════════════
   UPDATE STUDENT
═══════════════════════════ */
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const fields = extractFields(req.body);

        Object.keys(fields).forEach(key => {
            if (key === 'password') return;
            if (fields[key] !== undefined && fields[key] !== '') {
                student[key] = fields[key];
            }
        });

        // Re-run full analysis pipeline on updated data
        const { riskScore, riskLevel, stressLevel } = analyzeStudent(student);
        student.stressLevel = stressLevel;
        student.riskScore = riskScore;
        student.riskLevel = riskLevel;

        if (fields.password && fields.password.trim() !== '') {
            student.password = fields.password;
        }

        const updated = await student.save();
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

/* ═══════════════════════════
   DELETE STUDENT
═══════════════════════════ */
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            await student.deleteOne();
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

/* ═══════════════════════════
   RESET PASSWORD
═══════════════════════════ */
const resetStudentPassword = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const { password } = req.body;
        if (!password || password.trim() === '') {
            return res.status(400).json({ message: 'New password is required' });
        }
        student.password = password;
        await student.save();
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

module.exports = {
    createStudent, loginStudent, getStudents, getStudentById,
    updateStudent, deleteStudent, resetStudentPassword
};
