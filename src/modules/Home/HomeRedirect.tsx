import { MouseEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '>/config/routes';
import {
  useAccountStore,
  useDialogStore,
  dialogStoreActions,
  configStoreActions,
} from '>/services/stores';
import { dialogActions } from '>/services/utils';
import { Login } from '>/modules';
import { CommonDialogHandlers } from '>/types';

export const HomeRedirect = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dialogStoreActions.closeDialog();
      navigate(routes.front.dbView, { replace: true });
    }
    const dbTheme = sessionStorage.getItem('dbTheme');
    if (dbTheme) {
      configStoreActions.setTheme(dbTheme);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const handlers: CommonDialogHandlers = {
      confirm: () => {},
    };
    const labels = [undefined, 'Login'];
    dialogStoreActions.openDialog({
      anonymous: true,
      payload: {
        initialSize: 'sm',
        caption: 'Authorization',
        component: <Login formHandlers={handlers} />,
        variant: 'error',
        actions: dialogActions
          .enabledConfirmCancel({
            onConfirm: () => {
              handlers.confirm();
              dialogStoreActions.closeDialog();
            },
          })
          .map((control, idx) => ({
            ...control,
            label: labels[idx] ?? control.label,
          })),
      },
    });
  };

  return (
    <>
      <div className='page-container items-center my-2'>
        <h1 className='page-title text-2xl font-bold'>
          Welcome to SoloBase SPA
        </h1>
        <div className='page-section bg-transparent max-w-lg'>
          <p className='central'>
            Access and manage your MySQL databases, monitor server activity,
            edit data, handle imports and exports, and configure your
            environment securely from one place.
          </p>
          <p className='central stand'>
            For documentation about this tool and latest updates, visit:
            <br />
            <a
              href='https://github.com/enigma1'
              className='stand link border-b'
              target='_blank'
              rel='noreferrer'
            >
              Enigma1 on GitHub
            </a>
          </p>
          <p className='central'>
            To begin managing your databases, login to your account
          </p>
          <p className='central'>
            <button className='btn' onClick={handleLogin}>
              Login
            </button>
          </p>
        </div>
      </div>
    </>
  );
};
