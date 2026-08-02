import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth as utilAuth } from '../utils/auth';

const PrivateRoute = ({ children, roles }) => {
  const { user: contextUser, token: contextToken, loading } = useAuth();

  const user = contextUser || utilAuth.getCurrentUser();
  const isAuthenticated = !!contextToken || utilAuth.isAuthenticated();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ color: 'var(--color-primary-600)', fontWeight: 600, fontSize: '16px' }}>Loading Portal...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const hasRegistered = localStorage.getItem('hasRegisteredBefore');
    return <Navigate to={hasRegistered ? "/login" : "/register"} replace />;
  }

  if (roles && (!user.role || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
