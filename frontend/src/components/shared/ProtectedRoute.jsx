import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectCurrentUser } from '@/redux/slices/userSlice';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = useSelector(selectCurrentUser);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;