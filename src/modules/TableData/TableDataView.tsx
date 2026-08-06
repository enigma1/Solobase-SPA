import { useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTableData, useTableColumnsInfoHook } from '>/services/queryHooks';
import {
  useAccountStore,
  dialogStoreActions,
  createFactoryTableStore,
  useColumnsStore,
} from '>/services/stores';
import { useUnsavedChangesBlocker } from '>/services/hooks';
import { openUnsavedChangesConfirmation } from '>/services/utils';
import { routes } from '>/config';
import {
  DataRowsList,
  ScreenLoader,
  EmptyListing,
  FiltersAndSortsNotice,
  dialogFactories,
} from '>/modules';
import { SqlColumnsShape, SqlRow, ViewRow } from '>/types';

export const TableDataView = () => {
  const navigate = useNavigate();
  const { dbSelected, activeTable, registerActiveTableGuard } = useAccountStore(
    ({ state, api }) => ({
      activeTable: state.activeTable,
      dbSelected: state.dbSelected,
      registerActiveTableGuard: api.registerActiveTableGuard,
    }),
  );

  const columnInfoRequest = {
    database: dbSelected ?? '',
    table: activeTable ?? '',
  };
  const { cols: colsInfo, isSuccess: isSuccessInfo } = useTableColumnsInfoHook(
    columnInfoRequest,
    ({ state, query }) => ({
      cols: state.cols,
      isSuccess: query.isSuccess,
    }),
  );

  const tableStore = useMemo(
    () => createFactoryTableStore({ listingType: 'dataRows' }),
    [],
  );

  const { pastColumnsActions, getSortBy, getFilters } = useColumnsStore(
    ({ state, api }) => ({
      pastColumnsActions: state.pastColumnsActions,
      getSortBy: api.getSortBy,
      getFilters: api.getFilters,
    }),
  );

  const { cPaging, hasEdits, clearEdits } = tableStore.useFactoryTableStore(
    ({ state, api }) => ({
      cPaging: state.paging,
      hasEdits: api.hasEdits,
      clearEdits: api.clearEdits,
    }),
  );

  useEffect(() => {
    return registerActiveTableGuard(async () => {
      if (!hasEdits()) {
        return true;
      }

      return await openUnsavedChangesConfirmation();
    });
  }, []);

  useUnsavedChangesBlocker({
    hasEdits,
    clearEdits,
  });

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
    rowTokens,
    responsePaging,
    isSuccess,
    isFetching,
  } = useTableData(
    request,
    ({ state, query }) => {
      return {
        rows: state.rows,
        cols: state.cols,
        columnsOrder: state.columnsOrder,
        rowTokens: state.rowTokens,
        responsePaging: state.paging,
        isSuccess: query.isSuccess,
        isError: query.isError,
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

  useEffect(() => {
    if (!isSuccess) return;
    tableStore.api.setPaging({
      hasNext: responsePaging?.hasNext ?? false,
      hasPrevious: responsePaging?.hasPrevious ?? false,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious]);

  const isBusy = isFetching;

  if (!dbSelected || !activeTable) {
    return <Navigate to={routes.front.home} replace />;
  }

  if (isBusy) {
    return <ScreenLoader />;
  }

  const onCreate = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createDataRows({
        database: dbSelected,
        table: activeTable,
      }),
    });
  };

  const onBack = () => {
    navigate(routes.front.listTables, {
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
        note={`No available rows in ${activeTable}`}
      >
        {notice}
      </EmptyListing>
    );
  }

  return (
    <DataRowsList
      rows={viewRows as ViewRow<SqlRow>[]}
      rowTokens={rowTokens}
      cols={cols as SqlColumnsShape}
      columnsOrder={columnsOrder}
      activeTable={activeTable}
      dbSelected={dbSelected}
      store={tableStore}
    />
  );
};
