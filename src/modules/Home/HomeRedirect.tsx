import { Navigate, useLocation } from 'react-router-dom';
import { useAccountStore } from '>/services/stores';
import { routes } from '>/config/routes';

export const HomeRedirect = () => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={routes.front.tableView} replace />;
  }

  return (
    <Navigate to={routes.front.login} replace state={{ from: location }} />
  );
};
