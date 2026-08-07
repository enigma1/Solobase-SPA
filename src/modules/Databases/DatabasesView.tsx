import { useMemo, useEffect } from 'react';
import { useDatabases, useTableColumnsInfoHook } from '>/services/queryHooks';
import {
  getColumnsFromRow,
  databaseFields,
  databaseBasics,
} from '>/services/utils';
import {
  FiltersAndSortsNotice,
  EmptyListing,
  ScreenLoader,
  dialogFactories,
} from '>/modules';
import {
  useColumnsStore,
  createFactoryTableStore,
  useAccountStore,
  dialogStoreActions,
} from '>/services/stores';
import { SqlColumnsShape, SqlRow, ViewRow } from '>/types';
import { DatabasesList } from './DatabasesList';

export const DatabasesMainView = () => {
  const dbSelected = useAccountStore(({ state }) => state.dbSelected);
  const tableStore = useMemo(
    () => createFactoryTableStore({ listingType: 'dbRows' }),
    [],
  );
  const { cols: colsInfo, isSuccess: isSuccessInfo } = useTableColumnsInfoHook(
    databaseBasics,
    ({ state, query }) => ({
      cols: state.cols,
      isSuccess: query.isSuccess,
    }),
  );

  const { pastColumnsActions, getSortBy, getFilters } = useColumnsStore(
    ({ state, api }) => ({
      pastColumnsActions: state.pastColumnsActions,
      getSortBy: api.getSortBy,
      getFilters: api.getFilters,
    }),
  );

  const { cPaging, clearSelected } = tableStore.useFactoryTableStore(
    ({ state, api }) => ({
      cPaging: state.paging,
      clearSelected: api.clearSelected,
    }),
  );

  const { cSortBy, cFilters, request } = useMemo(() => {
    const cSortBy = getSortBy(colsInfo);
    const cFilters = getFilters(colsInfo);

    const request = {
      paging: {
        limit: cPaging.limit,
        offset: cPaging.offset,
      },
      ...(Object.keys(cSortBy).length && { sortBy: cSortBy }),
      ...(Object.keys(cFilters).length && { filters: cFilters }),
    };

    return {
      cSortBy,
      cFilters,
      request,
    };
  }, [cPaging.limit, cPaging.offset, colsInfo, pastColumnsActions]);

  const {
    rows,
    cols,
    columnsOrder,
    responsePaging,
    isSuccess,
    isError,
    isLoading,
    isFetching,
  } = useDatabases(
    request,
    ({ state, query }) => {
      return {
        rows: state.rows,
        cols: state.cols,
        columnsOrder: state.columnsOrder,
        responsePaging: state.paging,
        isSuccess: query.isSuccess,
        isError: query.isError,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
      };
    },
    {
      enabled: isSuccessInfo,
    },
  );

  const viewRows: ViewRow<SqlRow>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: idx.toString(),
    }));
  }, [rows]);

  const uidSelected = useMemo(() => {
    if (!dbSelected) return undefined;

    for (const row of viewRows) {
      const colNames = getColumnsFromRow({
        row: row.row,
        columnsOrder,
        fields: [databaseFields.name],
      });
      if (colNames[databaseFields.name] === dbSelected) {
        return row.uiKey;
      }
    }

    return undefined;
  }, [dbSelected, viewRows, columnsOrder]);

  useEffect(() => {
    if (!isSuccess) return;

    tableStore.api.setPaging({
      hasNext: responsePaging?.hasNext ?? false,
      hasPrevious: responsePaging?.hasPrevious ?? false,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious]);

  const isBusy = isFetching;
  if (isBusy) return <ScreenLoader />;

  const onCreate = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createTable(dbSelected),
    });
  };

  if (rows.length === 0) {
    const hasSorts = Object.keys(cSortBy).length > 0;
    const hasFilters = Object.keys(cFilters).length > 0;

    let notice;
    if (hasFilters || hasSorts) {
      notice = (
        <FiltersAndSortsNotice
          cols={cols}
          clearSorts={hasSorts}
          clearFilters={hasFilters}
        />
      );
    }
    notice = (
      <div className='wrapper'>
        <button type='button' className='btn' onClick={onCreate}>
          New Database
        </button>
      </div>
    );
    return (
      <EmptyListing
        onCreate={onCreate}
        note={`${dbSelected ? 'No Tables in database [' + dbSelected + ']' : 'No databases available'}`}
      >
        {notice}
      </EmptyListing>
    );
  }

  return (
    <DatabasesList
      rows={viewRows}
      cols={cols as SqlColumnsShape}
      columnsOrder={columnsOrder as string[]}
      store={tableStore}
      uidSelected={uidSelected}
    />
  );
};
