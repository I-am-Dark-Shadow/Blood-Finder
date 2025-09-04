import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home if role is not allowed
    return <Navigate to="/" replace />;
  }

  // If Outlet is used, it will render the nested child routes
  // If a component is passed as a child, it will render that
  return <Outlet />;
};

export default ProtectedRoute;