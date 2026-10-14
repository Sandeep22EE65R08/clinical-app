import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '../types';
import { useAuth } from '../auth/AuthContext';

// `portal` marks a patient-only area. Staff areas (default) keep patients out
// and vice versa, so the two experiences never bleed into each other.
export default function ProtectedRoute(
  { children, roles, portal }: { children: ReactNode; roles?: Role[]; portal?: boolean },
) {
  const { user, hasRole } = useAuth();
  if (!user) return <Navigate to={portal ? '/portal/login' : '/login'} replace />;

  const isPatient = user.role === 'Patient';
  if (portal && !isPatient) return <Navigate to="/" replace />;
  if (!portal && isPatient) return <Navigate to="/portal" replace />;

  if (roles && !hasRole(...roles)) return <Navigate to={portal ? '/portal' : '/'} replace />;
  return <>{children}</>;
}
