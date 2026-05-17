import { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAccountStore } from '>/services/stores';
import { routes } from '>/config/routes';

export const AuthGuard = () => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to={routes.front.home} replace state={{ from: location }} />
    );
  }

  return <Outlet />;
};

export const Auth = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : null;
};
