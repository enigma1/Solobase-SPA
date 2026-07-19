import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '>/config/routes';
import {
  useAccountStore,
  dialogStoreActions,
  configStoreActions,
} from '>/services/stores';
import { handleLogin } from '>/modules';

export const HomeRedirect = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dialogStoreActions.closeDialog();
      navigate(routes.front.listDatabases, { replace: true });
    }
    const theme = sessionStorage.getItem('theme');
    if (theme) {
      configStoreActions.setTheme(theme);
    }
  }, [isAuthenticated]);

  return (
    <>
      <div className='page-container items-center my-2  justify-center h-screen'>
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
