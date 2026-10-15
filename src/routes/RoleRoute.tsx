import { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, getUserRole, type UserRole } from '../contexts/AuthContext';

// Gating de rota por papel — defesa em profundidade / UX.
// O backend continua sendo a fonte da verdade (retorna 403); isto apenas
// impede que telas restritas sejam abertas por quem não tem o papel.
export function RoleRoute({
  roles,
  children,
}: {
  roles: UserRole[];
  children: JSX.Element;
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  if (!roles.includes(getUserRole(user))) {
    return <Navigate to='/home' replace />;
  }

  return children;
}
