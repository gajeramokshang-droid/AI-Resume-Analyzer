import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;

// PrivateRoute is a security gate. It waits until your auth state is loaded, then either allows access to the protected component or redirects to login.