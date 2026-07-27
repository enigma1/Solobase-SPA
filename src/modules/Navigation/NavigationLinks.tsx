import { useEffect } from 'react';
import {
  CogIcon,
  LogOutIcon,
  DatabaseSearchIcon,
  DatabaseArrowUpIcon,
} from 'lucide-react';
import { useConfigStore, dialogStoreActions } from '>/services/stores';
import { useThemeOptions } from '>/services/hooks';
import { ComboBox, Auth, QueryInput, dialogFactories } from '>/modules';
import { handleLogout } from '>/modules/Account';

export const AuthNavigationLinks = () => {
  const { theme, setTheme } = useConfigStore(({ state, api }) => ({
    theme: state.theme,
    setTheme: api.setTheme,
  }));

  const mergedThemes = useThemeOptions();

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
  const handleImportSql = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.importData(),
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
              //$options={mergedThemes}
              $groups={mergedThemes}
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
              title='Import SQL'
              onClick={handleImportSql}
            >
              <DatabaseArrowUpIcon size={24} />
            </button>
            <button
              className='btn'
              title='Preferences and Settings'
              onClick={handlePreferences}
            >
              <CogIcon size={24} />
            </button>
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
