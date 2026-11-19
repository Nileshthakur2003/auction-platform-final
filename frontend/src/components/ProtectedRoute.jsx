import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, loading, userType } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 vw-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRole !== undefined && String(userType) !== String(allowedRole)) {
    // Redirect to the appropriate dashboard if role does not match
    return <Navigate to={String(userType) === '1' ? '/seller' : '/buyer'} replace />;
  }

  return children;
};

export default ProtectedRoute;
