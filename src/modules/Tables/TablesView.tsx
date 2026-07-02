import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAccountStore,
  tablesDataStoreActions,
  dialogStoreActions,
} from '>/services/stores';
import { queryKeys, useTablesHook } from '>/services/queryHooks';
import { EmptyPage, ScreenLoader, dialogFactories } from '>/modules';
import type { ViewRow, Scalar } from '>/types';
import { TablesList } from './TablesList';

export const TablesMainView = () => {
  const queryClient = useQueryClient();
  const { dbSelected, activeTable } = useAccountStore(({ state }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
  }));

  const {
    rows,
    cols,
    columnsOrder,
    isSuccess,
    isError,
    isFetching,
    isFetched,
  } = useTablesHook(({ state, query }) => {
    return {
      rows: state.rows,
      cols: state.cols,
      columnsOrder: state.columnsOrder,
      isSuccess: query.isSuccess,
      isError: query.isError,
      isFetching: query.isFetching,
      isFetched: query.isFetched,
    };
  });

  const viewRows: ViewRow<Scalar[]>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: idx.toString(),
    }));
  }, [rows]);

  useEffect(() => {
    if (!dbSelected || !activeTable) {
      tablesDataStoreActions.initialize();
    }
  }, [dbSelected, activeTable]);

  const handleCreateTable = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createTable(dbSelected),
    });
  };

  const isBusy = isFetching;
  if (!dbSelected || (isFetched && rows.length === 0)) {
    return (
      <EmptyPage
        onCreate={handleCreateTable}
        note={`${dbSelected ? 'No Tables in database [' + dbSelected + ']' : 'No database selected'}`}
      />
    );
  }

  return (
    <>
      {isBusy && <ScreenLoader />}
      <TablesList
        dbSelected={dbSelected}
        rows={viewRows}
        cols={cols}
        columnsOrder={columnsOrder}
      />
    </>
  );
};
