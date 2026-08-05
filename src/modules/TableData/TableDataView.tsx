import { useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableData } from '>/services/queryHooks';
import {
  useAccountStore,
  tablesDataStoreActions,
  dialogStoreActions,
  createFactoryTableStore,
  configStoreActions,
} from '>/services/stores';
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
  const { dbSelected, activeTable } = useAccountStore(({ state, api }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
  }));
  const tableStore = useMemo(
    () => createFactoryTableStore({ listingType: 'dataRows' }),
    [dbSelected, activeTable],
  );

  const restoredPrefs = useRef(false);
  const navigate = useNavigate();
  const { cPaging, cSortBy, cFilters } = tableStore.useFactoryTableStore(
    ({ state }) => ({
      cPaging: state.paging,
      cFilters: state.filters,
      cSortBy: state.sortBy,
    }),
  );
  useEffect(() => {
    tablesDataStoreActions.initialize();
    // const prefs = configStoreActions.getPastColumnsActions(cols);
    // tableStore.api.restorePreferences(prefs);
  }, [dbSelected, activeTable]);

  const request = useMemo(
    () => ({
      paging: {
        limit: cPaging.limit,
        offset: cPaging.offset,
      },
      ...(Object.keys(cSortBy).length && { sortBy: cSortBy }),
      ...(Object.keys(cFilters).length && { filters: cFilters }),
    }),
    [cPaging.limit, cPaging.offset, cSortBy, cFilters],
  );

  const {
    rows,
    cols,
    columnsOrder,
    rowTokens,
    responsePaging,
    isSuccess,
    isFetching,
  } = useTableData(request, ({ state, query }) => {
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
  });

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

    if (!restoredPrefs.current) {
      restoredPrefs.current = true;

      const prefs = configStoreActions.getPastColumnsActions(cols);
      tableStore.api.restorePreferences(prefs);
      return;
    }

    // Persist current filters and ssorts
    const pastColumns = configStoreActions.getPastColumnsActions();
    const nextPastColumns = {
      ...pastColumns,
    };

    for (const [column, sort] of Object.entries(cSortBy)) {
      nextPastColumns[column] = {
        ...nextPastColumns[column],
        type: cols[column].type,
        sort: sort.direction,
      };
    }

    for (const [column, filters] of Object.entries(cFilters)) {
      nextPastColumns[column] = {
        ...nextPastColumns[column],
        type: cols[column].type,
        filters,
      };
    }

    configStoreActions.savePreferences({
      pastColumnsActions: nextPastColumns,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious, cols]);

  const isBusy = isFetching;

  if (!dbSelected || !activeTable) {
    return null;
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
          store={tableStore}
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
