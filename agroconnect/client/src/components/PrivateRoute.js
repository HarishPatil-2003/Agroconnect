import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../utils/auth';

const PrivateRoute = ({ children, roles }) => {
  const user = auth.getCurrentUser();
  const isAuthenticated = auth.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
