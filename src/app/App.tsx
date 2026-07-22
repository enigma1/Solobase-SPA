import { useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { messageStoreActions, accountStoreActions } from '>/services/stores';
import { useSessionRestore } from '>/services/queryHooks';
import {
  RootLayout,
  AuthGuard,
  QueryView,
  QueriesList,
  DatabasesMainView,
  TableDataView,
  TablesMainView,
  GuestGuard,
  HomeRedirect,
  NetworkDown,
  UsersList,
  ImportView,
  ScreenLoader,
} from '>/modules';
import { isNonEmptyString } from '>/services/utils';
import { routes, demoMode } from '>/config';
import { AppBootstrap } from './AppBootstrap';

export const App = () => {
  const { session, isSuccess, isFetching } = useSessionRestore(
    ({ query, state }) => ({
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
      session: state,
    }),
  );
  // used to block session restore after logout
  useEffect(() => {
    if (demoMode) {
      messageStoreActions.addMessage({
        type: 'error',
        mode: 'top',
        fixed: true,
        id: 'demo',
        content: {
          text: `Solobase SPA Demo Mode — Mocked backend with prerecorded responses which may not exactly match previous selections.`,
        },
      });
    }
    const canRestore = sessionStorage.getItem('can-restore');
    if (canRestore !== 'true') {
      sessionStorage.setItem('can-restore', 'true');
    }
  }, []);

  useEffect(() => {
    if (isSuccess && session && isNonEmptyString(session.username)) {
      console.log('session', session);
      accountStoreActions.setCapabilities(session.capabilities);
      messageStoreActions.addMessage({
        type: 'success',
        content: {
          text: `Session restored - welcome back ${session.username}`,
          duration: 3000,
        },
      });
    }
  }, [isSuccess]);

  const router = createBrowserRouter([
    {
      path: '',
      element: <RootLayout />,
      children: [
        {
          index: true, // set as the home page "/"
          element: <HomeRedirect />,
        },
        {
          path: routes.front.networkDown,
          element: <NetworkDown />,
        },
        {
          path: '*',
          element: <Navigate to={routes.front.home} replace />,
        },

        // Anonymous routes
        {
          element: <GuestGuard />,
          children: [{ path: routes.front.home, element: <HomeRedirect /> }],
        },

        // Authorized routes
        {
          element: <AuthGuard />,
          children: [
            {
              path: routes.front.importView,
              element: <ImportView />,
            },
            {
              path: routes.front.listDatabases,
              element: <DatabasesMainView />,
            },
            {
              path: routes.front.listTables,
              element: <TablesMainView />,
            },
            {
              path: routes.front.listData,
              element: <TableDataView />,
            },
            {
              path: routes.front.listQueries,
              element: <QueriesList />,
            },
            {
              path: routes.front.queryView,
              element: <QueryView />,
            },
            {
              path: routes.front.listUsers,
              element: <UsersList />,
            },
          ],
        },
      ],
    },
  ]);

  const isBusy = !isSuccess && isFetching;
  if (isBusy) return <ScreenLoader />;
  return (
    <>
      <AppBootstrap>
        <RouterProvider router={router} />;
      </AppBootstrap>
    </>
  );
};
