import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { aStub } from '>/services/utils';
import { routes } from '>/config';
import { queryKeys, useDatabases } from '>/services/queryHooks';
import {
  useDialogStore,
  useAccountStore,
  useTablesStore,
} from '>/services/stores';
import { DialogRenderer, ScreenLoader } from '>/modules/Common';
import { dbDialogMap } from './DialogMap';

export const DatabasesList = () => {
  const queryClient = useQueryClient();

  const { initialize, activeTable } = useTablesStore(({ api, state }) => ({
    initialize: api.initialize,
    activeTable: state.activeTable,
  }));

  const { dbSelected, setDatabaseSelection } = useAccountStore(
    ({ state, api }) => ({
      dbSelected: state.dbSelected,
      setDatabaseSelection: api.setDatabaseSelection,
    }),
  );

  // const { dialog, openDialog, closeDialog } = useDialogStore(
  //   ({ state, api }) => ({
  //     openDialog: api.openDialog,
  //     closeDialog: api.closeDialog,
  //     dialog: state.dialog,
  //   }),
  // );

  const { dbList, isError, isLoading, isSuccess } = useDatabases(
    ({ state, query }) => ({
      dbList: state.databases,
      isError: query.isError,
      isLoading: query.isLoading,
      isSuccess: query.isSuccess,
    }),
  );

  useEffect(() => {
    if (!dbSelected && dbList.length > 0) {
      initialize();
      return;
    }

    queryClient.invalidateQueries({
      queryKey: queryKeys.rows(dbSelected, activeTable),
      exact: true,
    });

    queryClient.invalidateQueries({
      queryKey: queryKeys.tables(dbSelected),
      exact: true,
    });

    queryClient.invalidateQueries({
      queryKey: queryKeys.databases(),
      exact: true,
    });
  }, [dbSelected]);

  const handleDbChange = async (dbName: string) => {
    setDatabaseSelection(dbName);
    initialize();
  };

  return (
    <>
      <div className='side-list'>
        {dbList.length > 0 ? (
          dbList.map((name, idx) => {
            const isSelected = dbSelected === name;
            return (
              <button
                key={`${name}-${idx}`}
                className='side-list-item'
                data-active={isSelected}
                onClick={() => handleDbChange(name)}
              >
                {name}
              </button>
            );
          })
        ) : (
          <div className='side-list-empty'>No Databases</div>
        )}
      </div>
      {isLoading && <ScreenLoader />}
    </>
  );
};
