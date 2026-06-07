import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccountStore, tablesDataStoreActions } from '>/services/stores';
import { queryKeys, useTablesHook } from '>/services/queryHooks';
import { EmptyPage, ScreenLoader } from '>/modules';
import type { ViewRow, Scalar } from '>/types';
import { TablesList } from './TablesList';

export const TablesMainView = () => {
  const queryClient = useQueryClient();
  const { dbSelected, activeTable } = useAccountStore(({ state, api }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
  }));

  const { rows, cols, columnsOrder, isSuccess, isError, isFetching } =
    useTablesHook(({ state, query }) => {
      return {
        rows: state.rows,
        cols: state.cols,
        columnsOrder: state.columnsOrder,
        isSuccess: query.isSuccess,
        isError: query.isError,
        isFetching: query.isFetching,
      };
    });

  const viewRows: ViewRow<Scalar[]>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: idx,
    }));
  }, [rows]);

  useEffect(() => {
    if (!dbSelected || !activeTable) {
      tablesDataStoreActions.initialize();
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
  }, [dbSelected, activeTable]);

  if (isFetching) return <ScreenLoader />;
  return (
    <>
      {dbSelected && isSuccess && rows.length > 0 ? (
        <TablesList
          dbSelected={dbSelected}
          rows={viewRows}
          cols={cols}
          columnsOrder={columnsOrder}
        />
      ) : (
        <EmptyPage
          note={`${dbSelected ? 'No Tables in database: ' + dbSelected : 'No database selected'}`}
        />
      )}
    </>
  );
};
