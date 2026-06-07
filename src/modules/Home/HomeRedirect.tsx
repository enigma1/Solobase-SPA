import { MouseEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAccountStore,
  useDialogStore,
  dialogStoreActions,
  accountStoreActions,
} from '>/services/stores';
import { routes } from '>/config/routes';
import { Login } from '>/modules';

export const HomeRedirect = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);

  // const { dialog } = useDialogStore(({ state }) => ({
  //   dialog: state.dialog,
  // }));

  useEffect(() => {
    if (isAuthenticated) {
      dialogStoreActions.closeDialog();
      navigate(routes.front.dbView, { replace: true });
    }
    const dbTheme = sessionStorage.getItem('dbTheme');
    if (dbTheme) {
      accountStoreActions.setTheme(dbTheme);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dialogStoreActions.openDialog({
      payload: {
        caption: 'Enter your credentials',
        component: <Login />,
        variant: 'warn',
      },
    });
  };

  return (
    <>
      <div className='page-container'>
        <div className='page-toolbar'>
          <div className='page-title'>Welcome to the Database Manager</div>
        </div>
        <div className='page-content'>
          <p>
            Access and manage your MySQL databases, monitor server activity,
            edit data, handle imports and exports, and configure your
            environment securely from one place.
          </p>

          <p>
            For documentation about this tool, visit{' '}
            <a
              href='https://github.com/<myuseraccountname>'
              className='link'
              target='_blank'
              rel='noreferrer'
            >
              GitHub
            </a>
          </p>

          <p>
            To begin, please{' '}
            <a href='#' className='link' onClick={handleLogin}>
              sign in to your account to continue
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
};
