import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, token, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return null;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
