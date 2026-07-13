import { useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDatabases, useSelectDatabaseWrap } from '>/services/queryHooks';
import {
  useConfigStore,
  useAccountStore,
  useTablesDataStore,
  createFactoryTableStore,
} from '>/services/stores';
import { routes } from '>/config';
import { SidePagination, ScreenLoader } from '>/modules';
import { PagingContext } from '>/types';

export const DatabasesSideList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const store = useMemo(
    () => createFactoryTableStore({ listingType: 'dbRows' }),
    [],
  );
  const { pageSizes } = useConfigStore(({ state }) => ({
    pageSizes: state.pageSizes,
  }));

  const { paging } = store.useFactoryTableStore(({ state }) => ({
    paging: state.paging,
  }));

  const { initialize } = useTablesDataStore(({ api }) => ({
    initialize: api.initialize,
  }));

  const { dbSelected } = useAccountStore(({ state }) => ({
    dbSelected: state.dbSelected,
  }));

  const { dbList, responsePaging, isError, isFetching, isSuccess } =
    useDatabases(
      {
        paging: {
          limit: paging.limit,
          offset: paging.offset,
        },
      },
      ({ state, query, api }) => ({
        dbList: api.getDbNames() as string[],
        responsePaging: state.paging,
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

  useEffect(() => {
    if (!isSuccess) return;

    store.api.setPaging({
      hasNext: responsePaging?.hasNext ?? false,
      hasPrevious: responsePaging?.hasPrevious ?? false,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious]);

  useEffect(() => {
    store.api.setPaging({
      limit: pageSizes.dbRows,
      offset: 0,
    });
  }, [pageSizes.dbRows]);

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

  const start = paging.offset + 1;
  const end = paging.offset + dbList.length;

  const pagingContext: Omit<PagingContext, 'onPageSize' | 'currentSize'> & {
    currentSet: string;
  } = {
    hasNext: paging.hasNext,
    hasPrevious: paging.hasPrevious,
    currentSet: `${start}-${end}`,
    onNextPage: () => {
      store.api.setPaging({
        offset: paging.offset + paging.limit,
      });
    },

    onPreviousPage: () => {
      store.api.setPaging({
        offset: Math.max(0, paging.offset - paging.limit),
      });
    },
  };

  const isBusy = isFetching || isPending;
  if (isBusy) return <ScreenLoader />;

  return (
    <>
      <div className='side-list'>
        {dbList.length > 0 ? (
          <>
            {dbList.map((db, idx) => {
              const isSelected = dbSelected === db;
              return (
                <button
                  key={`${db}-${idx}`}
                  className='side-list-item'
                  data-active={isSelected}
                  onClick={() => handleChange(db)}
                >
                  {db}
                </button>
              );
            })}
            <SidePagination {...pagingContext} />
          </>
        ) : (
          <div className='side-list-empty'>No Databases</div>
        )}
      </div>
    </>
  );
};
