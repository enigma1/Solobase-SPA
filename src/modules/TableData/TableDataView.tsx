import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { routes } from '>/config';
import { queryKeys, useTableDataHook } from '>/services/queryHooks';
import {
  useAccountStore,
  tablesDataStoreActions,
  dialogStoreActions,
} from '>/services/stores';
import {
  CollectionView,
  CollectionViewType,
  SqlView,
  ScreenLoader,
  EmptyPage,
  EmptyListing,
  dialogFactories,
} from '>/modules';
import { SqlColumnsShape, SqlRow, CollectionRow } from '>/types/dbTables';

type ViewRow<T> = {
  row: T;
  uiKey: number;
};

export const TableDataView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryClient = useQueryClient();
  const { dbSelected, activeTable } = useAccountStore(({ state, api }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
  }));

  const { rows, cols, columnsOrder, type, isSuccess, isError, isFetching } =
    useTableDataHook(({ state, query }) => {
      return {
        rows: state.rows,
        cols: state.cols,
        columnsOrder: state.columnsOrder,
        type: state.type,
        isSuccess: query.isSuccess,
        isError: query.isError,
        isFetching: query.isFetching,
      };
    });

  const viewRows: ViewRow<SqlRow | CollectionRow>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: idx,
    }));
  }, [rows]);

  useEffect(() => {
    tablesDataStoreActions.initialize();
    if (!dbSelected || !activeTable) {
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

  const isBusy = isFetching;

  if (!dbSelected) {
    navigate(routes.front.dbView, { replace: true });
    return null;
  }
  if (!activeTable) {
    navigate(routes.front.listTables, { replace: true });
    return null;
  }

  const onCreate = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createDataRows({
        database: dbSelected,
        table: activeTable,
      }),
    });
  };

  if (isBusy) {
    return <ScreenLoader />;
  }

  if (rows.length === 0) {
    return (
      <EmptyListing
        onCreate={onCreate}
        note={`No available rows in ${activeTable}`}
      />
    );
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
