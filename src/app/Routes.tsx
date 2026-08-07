import { createBrowserRouter, Navigate } from 'react-router-dom';
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
  UsersView,
  ImportView,
} from '>/modules';
import { routes } from '>/config';

export const browserRouter = createBrowserRouter([
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
            path: routes.front.usersView,
            element: <UsersView />,
          },
        ],
      },
    ],
  },
]);
