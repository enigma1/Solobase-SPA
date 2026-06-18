import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Routes,
  Route,
  createBrowserRouter,
  Await,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { messageStoreActions, accountStoreActions } from '>/services/stores';
import { queryKeys, useSessionRestore } from '>/services/queryHooks';
import {
  RootLayout,
  AuthGuard,
  QueryView,
  QueriesList,
  DatabasesMainView,
  DatabaseNew,
  SettingsView,
  TableDataView,
  TablesMainView,
  GuestGuard,
  HomeRedirect,
  Login,
  NetworkDown,
} from '>/modules';
import { isNonEmptyString } from '>/services/utils';

import { routes } from '>/config';

export const App = () => {
  const queryClient = useQueryClient();
  const { session, isSuccess } = useSessionRestore(({ query, state }) => ({
    isSuccess: query.isSuccess,
    session: state,
  }));

  // used to block session restore after logout
  useEffect(() => {
    const canRestore = sessionStorage.getItem('can-restore');
    if (canRestore !== 'true') {
      sessionStorage.setItem('can-restore', 'true');
    }
  }, []);

  useEffect(() => {
    if (isSuccess && session && isNonEmptyString(session.username)) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.databases(),
        exact: true,
      });

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
          index: true, // this is "/"
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
        // {
        //   path: routes.front.login,
        //   element: <Account key={location.pathname} />,
        // },
        {
          element: <GuestGuard />,
          children: [
            { path: routes.front.home, element: <HomeRedirect /> },
            // { path: routes.front.login, element: <Login /> },
            // { path: routes.front.register, element: <Register /> },
          ],
        },
        // PROTECTED
        {
          element: <AuthGuard />,
          children: [
            // {
            //   path: routes.front.logout,
            //   element: <Logout />,
            // },
            {
              path: routes.front.newDatabase,
              element: <DatabaseNew />,
            },

            {
              path: routes.front.dbView,
              element: <DatabasesMainView />,
            },
            {
              path: routes.front.tableView,
              element: <TableDataView />,
            },
            {
              path: routes.front.listTables,
              element: <TablesMainView />,
            },
            {
              path: routes.front.queriesList,
              element: <QueriesList />,
            },
            {
              path: routes.front.queryView,
              element: <QueryView />,
            },
            {
              path: routes.front.settings,
              element: <SettingsView />,
            },

            // other protected routes...
          ],
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />;
    </>
  );
};
