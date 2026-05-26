import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CogIcon, LogOutIcon, DatabaseSearchIcon } from 'lucide-react';
import { useAccountStore, useDialogStore } from '>/services/stores';
import { ComboBox, Auth, QueryInput } from '>/modules';
import { routes, themes } from '>/config';

export const AuthNavigationLinks = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { dbSelected, theme, setTheme } = useAccountStore(({ state, api }) => ({
    dbSelected: state.dbSelected,
    theme: state.theme,
    setTheme: api.setTheme,
  }));
  const { dialog, openDialog, closeDialog } = useDialogStore(
    ({ api, state }) => ({
      dialog: state.dialog,
      openDialog: api.openDialog,
      closeDialog: api.closeDialog,
    }),
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleQueryExecute = () => {};
  // const handleQueryExecute = () => {
  //                 openDialog({
  //               type: 'runQuery',
  //               payload: {
  //                 database: dbSelected,
  //                 onExecute: (newQuery: Scalar) => {
  //                   closeDialog();
  //           const newId = addQuery({
  //             query: variables.query,
  //             modified: data.query,
  //             database: dbSelected,
  //           });
  //           setQuerySelection(newId);
  //           queryClient.setQueryData(
  //             queryKeys.query(variables.database, newId),
  //             data,
  //           );

  //                   markEditedRow((previousState) => {
  //                     const prevRow =
  //                       (previousState as Record<number, ScalarObject>)[rId] || {};
  //                     const updatedRow = { ...prevRow };
  //                     updatedRow[cId] = newValue;
  //                     return {
  //                       ...previousState,
  //                       [rId]: updatedRow,
  //                     };
  //                   });
  //                 },
  //               },
  //             });

  // }
  return (
    <Auth>
      <div className='flex items-center gap-2 w-full'>
        <div className='flex w-48'>
          {/* <span
            className='flex flex-1 items-center cursor-pointer'
            onClick={() => document.getElementById('select-theme')?.focus()}
          >
            Theme:
          </span> */}
          <ComboBox
            value={theme}
            onChange={setTheme}
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
            title='Execute Query'
            onClick={handleQueryExecute}
          >
            <DatabaseSearchIcon size={24} />
          </button>
          <Link className='btn' to={routes.front.settings} title='Set Defaults'>
            <CogIcon size={24} />
          </Link>
          <Link
            className='btn-secondary'
            to={routes.front.logout}
            title='Logout'
          >
            <LogOutIcon size={24} />
          </Link>
        </nav>
      </div>
    </Auth>
  );
};
