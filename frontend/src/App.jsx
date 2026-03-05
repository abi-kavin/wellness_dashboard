import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import FacultyRegister from './pages/FacultyRegister.jsx';
import FacultyLogin from './pages/FacultyLogin.jsx';
import FacultyDashboard from './pages/FacultyDashboard.jsx';
import CreateStudent from './pages/CreateStudent.jsx';
import StudentLogin from './pages/StudentLogin.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mx-auto px-4 pb-12">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Navigate to="/faculty-login" />} />
                    <Route path="/faculty-register" element={<FacultyRegister />} />
                    <Route path="/faculty-login" element={<FacultyLogin />} />
                    <Route path="/student-login" element={<StudentLogin />} />

                    {/* Protected Faculty Routes */}
                    <Route element={<ProtectedRoute role="faculty" />}>
                        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
                        <Route path="/create-student" element={<CreateStudent />} />
                        <Route path="/edit-student/:id" element={<CreateStudent />} />
                    </Route>

                    {/* Protected Student Routes */}
                    <Route element={<ProtectedRoute role="student" />}>
                        <Route path="/student-dashboard" element={<StudentDashboard />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
