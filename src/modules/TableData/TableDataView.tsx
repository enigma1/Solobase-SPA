import { useEffect, useMemo } from 'react';
import { useTableDataHook } from '>/services/queryHooks';
import {
  useAccountStore,
  tablesDataStoreActions,
  dialogStoreActions,
} from '>/services/stores';
import {
  SqlView,
  ScreenLoader,
  EmptyListing,
  dialogFactories,
} from '>/modules';
import { SqlColumnsShape, SqlRow, ViewRow } from '>/types';

export const TableDataView = () => {
  const { dbSelected, activeTable } = useAccountStore(({ state, api }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
  }));

  const {
    rows,
    cols,
    columnsOrder,
    rowTokens,
    isSuccess,
    isError,
    isFetching,
  } = useTableDataHook(({ state, query }) => {
    return {
      rows: state.rows,
      cols: state.cols,
      rowTokens: state.rowTokens,
      columnsOrder: state.columnsOrder,
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
    tablesDataStoreActions.initialize();
  }, [dbSelected, activeTable]);

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

  if (rows.length === 0) {
    return (
      <EmptyListing
        onCreate={onCreate}
        note={`No available rows in ${activeTable}`}
      />
    );
  }

  return (
    <SqlView
      rows={viewRows as ViewRow<SqlRow>[]}
      rowTokens={rowTokens}
      cols={cols as SqlColumnsShape}
      columnsOrder={columnsOrder}
      activeTable={activeTable}
      dbSelected={dbSelected}
    />
  );
};
