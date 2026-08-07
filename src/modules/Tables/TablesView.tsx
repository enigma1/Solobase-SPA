import { useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  useAccountStore,
  dialogStoreActions,
  createFactoryTableStore,
  useColumnsStore,
} from '>/services/stores';
import { useTables, useTableColumnsInfoHook } from '>/services/queryHooks';
import {
  databaseTablesBasics,
  getColumnsFromRow,
  databaseFields,
} from '>/services/utils';
import { routes } from '>/config';
import {
  FiltersAndSortsNotice,
  EmptyListing,
  ScreenLoader,
  dialogFactories,
} from '>/modules';
import type { ViewRow, SqlRow } from '>/types';
import { TablesList } from './TablesList';

export const TablesMainView = () => {
  const navigate = useNavigate();
  const tableStore = useMemo(
    () => createFactoryTableStore({ listingType: 'tableRows' }),
    [],
  );

  const { dbSelected, activeTable } = useAccountStore(({ state }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
  }));

  const { cols: colsInfo, isSuccess: isSuccessInfo } = useTableColumnsInfoHook(
    databaseTablesBasics,
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
      database: dbSelected ?? '',
      table: activeTable ?? '',
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
  }, [
    dbSelected,
    activeTable,
    cPaging.limit,
    cPaging.offset,
    colsInfo,
    pastColumnsActions,
  ]);

  const {
    rows,
    cols,
    columnsOrder,
    responsePaging,
    isSuccess,
    isError,
    isFetching,
  } = useTables(
    request,
    ({ state, query }) => {
      return {
        rows: state.rows,
        cols: state.cols,
        columnsOrder: state.columnsOrder,
        responsePaging: state.paging,
        isSuccess: query.isSuccess,
        isError: query.isError,
        isFetching: query.isFetching,
        isFetched: query.isFetched,
      };
    },
    {
      enabled: isSuccessInfo,
    },
  );

  const viewRows: ViewRow<SqlRow>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: (cPaging.offset + idx).toString(),
    }));
  }, [rows]);

  const uidSelected = useMemo(() => {
    if (!dbSelected) return undefined;

    for (const row of viewRows) {
      const { TABLE_NAME } = getColumnsFromRow({
        row: row.row,
        columnsOrder,
        fields: [databaseFields.table],
      });

      if (TABLE_NAME === activeTable) {
        return row.uiKey;
      }
    }

    return undefined;
  }, [dbSelected, viewRows, columnsOrder]);

  // useEffect(() => {
  //   clearSelected();
  // }, [dbSelected, activeTable]);

  // useEffect(() => {
  //   tableStore.api.setPaging({
  //     offset: 0,
  //   });
  // }, [dbSelected]);

  useEffect(() => {
    if (!isSuccess) return;

    tableStore.api.setPaging({
      hasNext: responsePaging?.hasNext ?? false,
      hasPrevious: responsePaging?.hasPrevious ?? false,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious]);

  if (!dbSelected) {
    return <Navigate to={routes.front.home} replace />;
  }

  const isBusy = !isSuccess && isFetching;
  if (isBusy) return <ScreenLoader />;

  const onCreate = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createTable(dbSelected),
    });
  };

  const onBack = () => {
    navigate(routes.front.listDatabases, {
      replace: true,
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
    return (
      <EmptyListing
        onCreate={onCreate}
        onBack={onBack}
        note={`${dbSelected ? 'No Tables in database [' + dbSelected + ']' : 'No database selected'}`}
      >
        {notice}
      </EmptyListing>
    );
  }

  return (
    <TablesList
      dbSelected={dbSelected}
      rows={viewRows}
      cols={cols}
      columnsOrder={columnsOrder}
      store={tableStore}
      uidSelected={uidSelected}
    />
  );
};
