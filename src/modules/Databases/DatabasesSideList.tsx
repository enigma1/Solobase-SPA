import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { routes } from '>/config';
import {
  queryKeys,
  useDatabases,
  useSelectDatabaseMutation,
} from '>/services/queryHooks';
import {
  useDialogStore,
  useAccountStore,
  useTablesDataStore,
  messageStoreActions,
} from '>/services/stores';
import { ScreenLoader } from '>/modules/Common';

export const DatabasesSideList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryClient = useQueryClient();

  const { initialize } = useTablesDataStore(({ api, state }) => ({
    initialize: api.initialize,
  }));

  const { activeTable, dbSelected, setActiveDatabase } = useAccountStore(
    ({ state, api }) => ({
      activeTable: state.activeTable,
      dbSelected: state.dbSelected,
      setActiveDatabase: api.setActiveDatabase,
    }),
  );

  // const { dialog, openDialog, closeDialog } = useDialogStore(
  //   ({ state, api }) => ({
  //     openDialog: api.openDialog,
  //     closeDialog: api.closeDialog,
  //     dialog: state.dialog,
  //   }),
  // );

  const { dbList, isError, isFetching, isSuccess } = useDatabases(
    ({ state, query, api }) => ({
      dbList: api.getDbNames() as string[],
      isError: query.isError,
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
    }),
  );

  const callbacks = {
    onSuccess: (data: any) => {
      setActiveDatabase(data.dbSelected);
      initialize();
      const view = routes.front.listTables;
      navigate(view, { replace: true });
    },
    onError: (error: any) => {
      console.error('what error is this', error);
      messageStoreActions.addMessage({
        content: { text: 'Failed to select database', duration: 3000 },
      });
    },
  };

  const { mutate, isPending, response } = useSelectDatabaseMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    callbacks,
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
    mutate({ name: dbName });
  };
  const isBusy = isFetching;

  return (
    <>
      {isBusy && <ScreenLoader />}
      <div className='side-list'>
        {dbList.length > 0 ? (
          dbList.map((db, idx) => {
            const isSelected = dbSelected === db;
            return (
              <button
                key={`${name}-${idx}`}
                className='side-list-item'
                data-active={isSelected}
                onClick={() => handleDbChange(db)}
              >
                {db}
              </button>
            );
          })
        ) : (
          <div className='side-list-empty'>No Databases</div>
        )}
      </div>
    </>
  );
};
