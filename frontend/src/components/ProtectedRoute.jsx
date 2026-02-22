import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedRoute({ children, roles }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/jobs" replace />;
    }

    return children;
}
