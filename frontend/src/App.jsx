import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ── Lazy Loading Pages ──
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const FacultyDashboard = lazy(() => import('./pages/FacultyDashboard.jsx'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard.jsx'));
const Students = lazy(() => import('./pages/Students.jsx'));
const StudentDetail = lazy(() => import('./pages/StudentDetail.jsx'));
const CreateStudent = lazy(() => import('./pages/CreateStudent.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Alerts = lazy(() => import('./pages/Alerts.jsx'));
const FacultyLogin = lazy(() => import('./pages/FacultyLogin.jsx'));
const FacultyRegister = lazy(() => import('./pages/FacultyRegister.jsx'));
const StudentLogin = lazy(() => import('./pages/StudentLogin.jsx'));

// Placeholder Loading Component
const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-12 w-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    </div>
);

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Faculty Routes */}
                <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/students/:id" element={<StudentDetail />} />
                <Route path="/create-student" element={<CreateStudent />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/faculty-login" element={<FacultyLogin />} />
                <Route path="/faculty-register" element={<FacultyRegister />} />

                {/* Student Routes */}
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/student-login" element={<StudentLogin />} />

                {/* Common Protected Routes */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/alerts" element={<Alerts />} />
            </Routes>
        </AnimatePresence>
    );
};

const App = () => {
    return (
        <Router>
            <Suspense fallback={<LoadingScreen />}>
                <AnimatedRoutes />
            </Suspense>
        </Router>
    );
};

export default App;

