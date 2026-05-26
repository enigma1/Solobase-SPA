import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Routes,
  Route,
  createBrowserRouter,
  Await,
  RouterProvider,
} from 'react-router-dom';
import { messageStoreActions } from '>/services/stores';
import { useSessionRestore } from '>/services/queryHooks';
import {
  RootLayout,
  AuthGuard,
  QueryView,
  DatabasesMainView,
  DatabaseNew,
  SettingsView,
  TableDataView,
  TablesMainView,
  GuestGuard,
  HomeRedirect,
  Login,
  Logout,
  NetworkDown,
} from '>/modules';
import { routes } from '>/config';

const defaultThemeProps = {
  colors: 'default', // semantic theme
  typography: 'default', // alternate typography sets
  spacing: 'default', // spacing token set
};

export const App = () => {
  const { session, isSuccess } = useSessionRestore(({ query, state }) => ({
    isSuccess: query.isSuccess,
    session: state,
  }));

  useEffect(() => {
    if (isSuccess && session) {
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
        // {
        //   path: routes.front.login,
        //   element: <Account key={location.pathname} />,
        // },
        {
          element: <GuestGuard />,
          children: [
            { path: routes.front.home, element: <Login /> },
            { path: routes.front.login, element: <Login /> },
            // { path: routes.front.register, element: <Register /> },
          ],
        },
        // PROTECTED
        {
          element: <AuthGuard />,
          children: [
            {
              path: routes.front.logout,
              element: <Logout />,
            },
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
