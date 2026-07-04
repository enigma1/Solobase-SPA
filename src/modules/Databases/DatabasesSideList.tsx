import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDatabases, useSelectDatabaseWrap } from '>/services/queryHooks';
import {
  useAccountStore,
  useTablesDataStore,
  messageStoreActions,
} from '>/services/stores';
import { routes } from '>/config';

import { ScreenLoader } from '>/modules';

export const DatabasesSideList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { initialize } = useTablesDataStore(({ api, state }) => ({
    initialize: api.initialize,
  }));

  const { dbSelected } = useAccountStore(({ state, api }) => ({
    dbSelected: state.dbSelected,
  }));

  const { dbList, isError, isFetching, isSuccess } = useDatabases(
    ({ state, query, api }) => ({
      dbList: api.getDbNames() as string[],
      isError: query.isError,
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
    }),
  );

  const { mutate, isPending } = useSelectDatabaseWrap();

  useEffect(() => {
    if (!dbSelected && dbList.length > 0) {
      initialize();
    }
  }, [dbSelected]);

  const handleChange = async (dbName: string) => {
    if (!dbName) {
      console.log('no database selected');
      return;
    }
    mutate({ database: dbName });
    if (location.pathname !== routes.front.listTables) {
      navigate(routes.front.listTables, { replace: true });
    }
  };

  const isBusy = isFetching || isPending;
  if (isBusy) return <ScreenLoader />;

  return (
    <>
      <div className='side-list'>
        {dbList.length > 0 ? (
          dbList.map((db, idx) => {
            const isSelected = dbSelected === db;
            return (
              <button
                key={`${name}-${idx}`}
                className='side-list-item'
                data-active={isSelected}
                onClick={() => handleChange(db)}
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
