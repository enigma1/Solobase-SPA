import { useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTables } from '>/services/queryHooks';
import { isObjectEmpty, dialogActions } from '>/services/utils';
import {
  useAccountStore,
  useTablesDataStore,
  dialogStoreActions,
  createFactoryTableStore,
  useConfigStore,
} from '>/services/stores';
import { ScreenLoader, DialogContent, SidePagination } from '>/modules';
import { routes } from '>/config';
import { PagingContext } from '>/types';

export const TablesSideList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const store = useMemo(
    () => createFactoryTableStore({ listingType: 'tableRows' }),
    [],
  );
  const { pageSizes } = useConfigStore(({ state }) => ({
    pageSizes: state.pageSizes,
  }));

  const { paging } = store.useFactoryTableStore(({ state }) => ({
    paging: state.paging,
  }));

  const { activeTable, setActiveTable, dbSelected } = useAccountStore(
    ({ state, api }) => ({
      dbSelected: state.dbSelected,
      activeTable: state.activeTable,
      setActiveTable: api.setActiveTable,
    }),
  );

  const { editedRow, markEditedRow } = useTablesDataStore(({ state, api }) => ({
    editedRow: state.editedRow,
    markEditedRow: api.markEditedRow,
  }));

  const { tables, responsePaging, isFetching, isSuccess } = useTables(
    {
      paging: {
        limit: paging.limit,
        offset: paging.offset,
      },
    },
    ({ api, state, query }) => ({
      tables: api.getTablesNames(),
      responsePaging: state.paging,
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
      isLoading: query.isLoading,
    }),
  );

  useEffect(() => {
    if (!isSuccess) return;

    store.api.setPaging({
      hasNext: responsePaging?.hasNext ?? false,
      hasPrevious: responsePaging?.hasPrevious ?? false,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious]);

  useEffect(() => {
    store.api.setPaging({
      limit: pageSizes.tableRows,
      offset: 0,
    });
  }, [pageSizes.tableRows]);

  const handleSwitchTable = (name: string) => {
    if (name === activeTable) {
      if (location.pathname !== routes.front.listData) {
        navigate(routes.front.listData);
      }
      return;
    }
    if (!isObjectEmpty(editedRow)) {
      dialogStoreActions.openDialog({
        payload: {
          caption: 'Unsaved Changes',
          component: (
            <DialogContent note='Data Row Edits'>
              {
                'You have unsaved changes. Switching tables will discard them. Continue?'
              }
            </DialogContent>
          ),
          actions: dialogActions.confirmCancel({
            onConfirm: () => {
              dialogStoreActions.closeDialog();
              markEditedRow({});
              setActiveTable(name);
              if (location.pathname !== routes.front.listData) {
                navigate(routes.front.listData);
              }
            },
          }),
        },
      });
      return;
    }
    setActiveTable(name);
    if (location.pathname !== routes.front.listData) {
      navigate(routes.front.listData);
    }
  };

  const start = paging.offset + 1;
  const end = paging.offset + tables.length;

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

  const isBusy = isFetching;
  if (isBusy) return <ScreenLoader />;
  return (
    <>
      <div className='side-list'>
        {tables.length > 0 ? (
          <>
            {tables.map((name: string) => {
              return (
                <button
                  key={name}
                  className='side-list-item'
                  data-active={activeTable === name}
                  onClick={() => handleSwitchTable(name)}
                >
                  {name}
                </button>
              );
            })}
            <SidePagination {...pagingContext} />
          </>
        ) : (
          <div className='side-list-empty'>No Tables</div>
        )}
      </div>
    </>
  );
};
