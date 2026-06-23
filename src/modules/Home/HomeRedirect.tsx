import { MouseEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '>/config/routes';
import {
  useAccountStore,
  useDialogStore,
  dialogStoreActions,
  accountStoreActions,
} from '>/services/stores';
import { dialogActions } from '>/services/utils';
import { Login } from '>/modules';
import { CommonDialogHandlers } from '>/types';

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
      <div className='page-container'>
        <div className='page-toolbar'>
          <div className='page-title'>Welcome to SoloBase SPA</div>
        </div>
        <div className='page-content'>
          <p>
            Access and manage your MySQL databases, monitor server activity,
            edit data, handle imports and exports, and configure your
            environment securely from one place.
          </p>
          <p>
            For documentation about this tool and latest updates, visit{' '}
            <a
              href='https://github.com/enigma1'
              className='stand link'
              target='_blank'
              rel='noreferrer'
            >
              Enigma1 on GitHub
            </a>
          </p>

          <p>To begin managing your databases, login to your account</p>
          <p>
            <button className='btn' onClick={handleLogin}>
              Login
            </button>
          </p>
        </div>
      </div>
    </>
  );
};
