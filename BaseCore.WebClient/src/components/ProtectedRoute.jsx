import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BYPASS_AUTH } from '../config/authBypass';
import { FullScreenLoading } from './common/Loading';

const ProtectedRoute = ({ children, adminOnly = false, allowedRoles = null }) => {
    const { isAuthenticated, isAdmin, hasRole, loading } = useAuth();
    const location = useLocation();

    if (BYPASS_AUTH) {
        return children;
    }

    if (loading) {
        return <FullScreenLoading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin()) {
        return <Navigate to="/" replace />;
    }

    if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
