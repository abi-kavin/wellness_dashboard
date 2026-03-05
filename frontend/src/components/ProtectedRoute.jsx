import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ role }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
        return <Navigate to="/faculty-login" />;
    }

    if (role && userInfo.role !== role) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
