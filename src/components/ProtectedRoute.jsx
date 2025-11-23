import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, userType }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUserType = localStorage.getItem('userType');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType && currentUserType !== userType) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

