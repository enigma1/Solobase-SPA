import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Routes,
  Route,
  createBrowserRouter,
  Await,
  RouterProvider,
} from 'react-router-dom';
import { useMessageStore } from '>/services/stores';
import { useSessionRestore } from '>/services/queryHooks';
import {
  RootLayout,
  AuthGuard,
  QueryView,
  DatabaseView,
  SettingsView,
  TableView,
  GuestGuard,
  HomeRedirect,
  Login,
  Logout,
} from '>/modules';
import { routes } from '>/config';

import { Message, MessageContent } from '>/types';

// import { useMessageStore } from '>/services/hooks';
// import { MessageContent } from '>/modules/Common';
// import { Message } from '>/types';

const defaultThemeProps = {
  colors: 'default', // semantic theme
  typography: 'default', // alternate typography sets
  spacing: 'default', // spacing token set
};

export const App = () => {
  const { session, isSuccess } = useSessionRestore(({ query, state }) => ({
    isSuccess: query.isSuccess,
    session: state.session,
  }));
  const addMessage = useMessageStore(({ api }) => api.addMessage);

  useEffect(() => {
    if (isSuccess && session) {
      addMessage({
        id: crypto.randomUUID(),
        type: 'success',
        mode: 'header',
        content: {
          text: `Session restored - welcome back ${session.username}`,
          duration: 3000,
        },
      } satisfies Message<MessageContent>);
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
              path: routes.front.dbView,
              element: <DatabaseView />,
            },
            {
              path: routes.front.tableView,
              element: <TableView />,
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
