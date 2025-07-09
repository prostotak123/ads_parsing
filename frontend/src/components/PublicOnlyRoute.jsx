// src/components/PublicOnlyRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PublicOnlyRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default PublicOnlyRoute;
