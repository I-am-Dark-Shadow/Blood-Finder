import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "User": return "/user/dashboard";
      case "Blood Bank": return "/blood-bank/dashboard";
      case "Test Lab": return "/test-lab/dashboard";
      default: return "/";
    }
  };

  return isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <Outlet />;
};

export default PublicRoute;