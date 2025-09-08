import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@store/slices/authSlice';
import { ROUTES } from '@constants';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedRoute;
