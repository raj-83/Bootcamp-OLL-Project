// frontend/src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
  redirectPath?: string;
}

const ProtectedRoute = ({ 
  allowedRoles, 
  redirectPath = '/login'
}: ProtectedRouteProps) => {
  const { user, isLoading, checkAccess } = useAuth();
  
  if (isLoading) {
    // Return a loading state if authentication is still being verified
    return <div>Loading...</div>;
  }
  
  // Check if user is authenticated and has required role
  if (!user || !checkAccess(allowedRoles)) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // If user is authenticated and has the correct role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;