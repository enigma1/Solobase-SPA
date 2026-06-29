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
import { messageStoreActions } from '>/services/stores';
import { queryKeys, useSessionRestore } from '>/services/queryHooks';
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
  TextView,
  ScreenLoader,
} from '>/modules';
import { isNonEmptyString } from '>/services/utils';

import { routes } from '>/config';

export const App = () => {
  const queryClient = useQueryClient();
  const { session, isSuccess, isFetching } = useSessionRestore(
    ({ query, state }) => ({
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
      session: state,
    }),
  );

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
          index: true, // this is "/" the home page
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
              path: routes.front.textView,
              element: <TextView />,
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
              path: routes.front.usersList,
              element: <UsersList />,
            },
          ],
        },
      ],
    },
  ]);

  const isBusy = isFetching;
  if (isBusy) return <ScreenLoader />;
  return (
    <>
      <RouterProvider router={router} />;
    </>
  );
};
