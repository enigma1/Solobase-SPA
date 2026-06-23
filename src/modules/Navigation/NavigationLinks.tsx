import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CogIcon, LogOutIcon, DatabaseSearchIcon } from 'lucide-react';
import { useAccountStore, dialogStoreActions } from '>/services/stores';
import {
  ComboBox,
  Auth,
  QueryInput,
  DialogContent,
  dialogFactories,
} from '>/modules';
import { dialogActions } from '>/services/utils';
import { handleLogout } from '>/modules/Account';
import { routes, themes } from '>/config';

export const AuthNavigationLinks = () => {
  // const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme, setTheme } = useAccountStore(({ state, api }) => ({
    theme: state.theme,
    setTheme: api.setTheme,
  }));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleQueryExecute = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.makeQuery(),
    });
  };

  const handlePreferences = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.editPreferences(),
    });
  };

  return (
    <>
      <Auth>
        <div className='flex items-center gap-2 w-full'>
          <div className='flex w-48'>
            <ComboBox
              value={theme}
              onChange={(t) => setTheme(t as string)}
              $options={themes.map((t) => ({
                value: t,
                label: t,
              }))}
              $placeholder='Select Theme'
            />
          </div>

          <div className='flex-1'>
            <QueryInput />
          </div>
          <nav className='flex items-center gap-2'>
            <button
              className='btn'
              title='Create Query'
              onClick={handleQueryExecute}
            >
              <DatabaseSearchIcon size={24} />
            </button>
            <button
              className='btn'
              title='Preferences and Settings'
              onClick={handlePreferences}
            >
              <CogIcon size={24} />
            </button>

            {/* <Link
              className='btn'
              to={routes.front.settings}
              title='Set Defaults'
            >
              <CogIcon size={24} />
            </Link> */}
            <button
              className='btn-secondary'
              title='Logout'
              onClick={() => handleLogout()}
            >
              <LogOutIcon size={24} />
            </button>
          </nav>
        </div>
      </Auth>
    </>
  );
};
