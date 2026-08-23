import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingIndicator from './LoadingIndicator';

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center p-6">
        <LoadingIndicator text="Verifying session credentials…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Prevent student users from accessing /admin
  if (location.pathname === '/admin' && user?.role === 'student' && user?.email !== 'collegeofcom@gmail.com') {
    return <Navigate to="/assistant" replace />;
  }

  return children;
}
