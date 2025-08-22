// src/components/PublicOnlyRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PublicOnlyRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        console.log('isAuthenticated', isAuthenticated);
        return <Navigate to="/workers/settings" replace />;
    }

    return children;
}

export default PublicOnlyRoute;
