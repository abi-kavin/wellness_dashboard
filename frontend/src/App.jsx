import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// ── Auth / Landing pages ──
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import FacultyLogin from './pages/FacultyLogin.jsx';    // kept for legacy link support
import FacultyRegister from './pages/FacultyRegister.jsx'; // kept for legacy link support
import StudentLogin from './pages/StudentLogin.jsx';    // kept for legacy link support

// ── Faculty pages (sidebar via FacultyLayout) ──
import FacultyDashboard from './pages/FacultyDashboard.jsx';
import Students from './pages/Students.jsx';
import StudentDetail from './pages/StudentDetail.jsx';
import Analytics from './pages/Analytics.jsx';
import Reports from './pages/Reports.jsx';
import Alerts from './pages/Alerts.jsx';
import Settings from './pages/Settings.jsx';
import CreateStudent from './pages/CreateStudent.jsx';

// ── Student pages ──
import StudentDashboard from './pages/StudentDashboard.jsx';

function App() {
    return (
        <Router>
            <Routes>
                {/* ── Default: go to login ── */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* ── Public Auth Routes ── */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Legacy routes kept so old bookmarks still work */}
                <Route path="/faculty-login" element={<FacultyLogin />} />
                <Route path="/faculty-register" element={<FacultyRegister />} />
                <Route path="/student-login" element={<StudentLogin />} />

                {/* ── Protected Faculty Routes ── */}
                <Route element={<ProtectedRoute role="faculty" />}>
                    <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/students/:id" element={<StudentDetail />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/create-student" element={<CreateStudent />} />
                    <Route path="/edit-student/:id" element={<CreateStudent />} />
                </Route>

                {/* ── Protected Student Routes ── */}
                <Route element={<ProtectedRoute role="student" />}>
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                </Route>

                {/* ── 404 fallback ── */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
