const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const facultyRoutes = require('./routes/facultyRoutes');
const studentRoutes = require('./routes/studentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();
connectDB();

const app = express();

// Allow localhost for local dev, the configured FRONTEND_URL, and
// fall back to the known Vercel domain so deployed frontend can reach the API
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    'https://wellness-dashboard-nine.vercel.app'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        // Allow exact matches or origins that start with an allowed origin
        const allowed = allowedOrigins.some(a => a && (origin === a || origin.startsWith(a)));
        if (allowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Local dev: listen on port with basic error handling
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        console.log(`\x1b[32m%s\x1b[0m`, `Frontend: http://localhost:3000`);
        console.log(`\x1b[36m%s\x1b[0m`, `Backend:  http://localhost:${PORT}`);
        console.log(`\x1b[33m%s\x1b[0m`, `Database: MongoDB Atlas (Cloud)`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\x1b[31m%s\x1b[0m`, `Error: Port ${PORT} is already in use.`);
            console.log(`Please run 'taskkill /F /IM node.exe' and try again.`);
            process.exit(1);
        } else {
            console.error(err);
        }
    });
}

module.exports = app;
