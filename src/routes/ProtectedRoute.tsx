import { useContext, type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  return children;
}
