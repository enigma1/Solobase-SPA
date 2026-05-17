import { Navigate, Outlet } from 'react-router-dom';
import { useAccountStore } from '>/services/stores';
import { routes } from '>/config/routes';

export const GuestGuard = () => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={routes.front.tableView} replace />;
  }

  return <Outlet />;
};

export const Guest = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : null;
};
