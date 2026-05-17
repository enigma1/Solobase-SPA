import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useTableDataHook } from '>/services/queryHooks';
import { useAccountStore, useTablesStore } from '>/services/stores';
import {
  CollectionView,
  CollectionViewType,
  SqlView,
  ScreenLoader,
} from '>/modules';
import { SqlColumnsShape, SqlRow, CollectionRow } from '>/types/dbTables';

type ViewRow<T> = {
  row: T;
  uiKey: number;
};

export const TableView = () => {
  const queryClient = useQueryClient();
  const { dbSelected } = useAccountStore(({ state, api }) => ({
    dbSelected: state.dbSelected,
  }));

  const { activeTable, initialize } = useTablesStore(({ state, api }) => ({
    activeTable: state.activeTable,
    initialize: api.initialize,
  }));

  const { rows, cols, columnsOrder, type, isSuccess, isError, isLoading } =
    useTableDataHook(({ state, query }) => {
      // console.log('rows', state.rows);
      // console.log('cols', state.cols);

      return {
        rows: state.rows,
        cols: state.cols,
        columnsOrder: state.columnsOrder,
        type: state.type,
        isSuccess: query.isSuccess,
        isError: query.isError,
        isLoading: query.isLoading,
      };
    });

  const viewRows: ViewRow<SqlRow | CollectionRow>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: idx,
    }));
  }, [rows]);

  useEffect(() => {
    if (!dbSelected || !activeTable) {
      initialize();
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

  return (
    <>
      {isSuccess &&
        (rows.length > 0 ? (
          type === 'collection' ? (
            <CollectionView
              key={activeTable}
              rows={rows as CollectionViewType}
            />
          ) : (
            <SqlView
              key={activeTable}
              rows={viewRows as ViewRow<SqlRow>[]}
              cols={cols as SqlColumnsShape}
              columnsOrder={columnsOrder as string[]}
            />
          )
        ) : (
          <div>No Rows in {activeTable}</div>
        ))}
      {isLoading && <ScreenLoader />}
    </>
  );
};
