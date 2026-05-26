import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useTableDataHook } from '>/services/queryHooks';
import { useAccountStore, tablesDataStoreActions } from '>/services/stores';
import {
  CollectionView,
  CollectionViewType,
  SqlView,
  ScreenLoader,
  EmptyPage,
} from '>/modules';
import { SqlColumnsShape, SqlRow, CollectionRow } from '>/types/dbTables';

type ViewRow<T> = {
  row: T;
  uiKey: number;
};

export const TableDataView = () => {
  const queryClient = useQueryClient();
  const { dbSelected, activeTable } = useAccountStore(({ state, api }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
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

  if (!dbSelected || !activeTable || !isSuccess) {
    return isLoading ? (
      <ScreenLoader />
    ) : (
      <EmptyPage note='Request Failure invalid database or table selected' />
    );
  }

  if (rows.length === 0) {
    return <EmptyPage note={`No available rows in ${activeTable}`} />;
  }

  return type === 'collection' ? (
    <CollectionView
      rows={rows as CollectionViewType}
      activeTable={activeTable}
      dbSelected={dbSelected}
    />
  ) : (
    <SqlView
      rows={viewRows as ViewRow<SqlRow>[]}
      cols={cols as SqlColumnsShape}
      columnsOrder={columnsOrder}
      activeTable={activeTable}
      dbSelected={dbSelected}
    />
  );
};
