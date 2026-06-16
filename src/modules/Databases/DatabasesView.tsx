import { useMemo } from 'react';
import { useDatabases, useDatabaseServerInfo } from '>/services/queryHooks';
import { SqlColumnsShape, SqlRow } from '>/types';
import { ScreenLoader, EmptyPage } from '>/modules';
import { DatabasesList } from './DatabasesList';

type ViewRow<T> = {
  row: T;
  uiKey: number;
};

export const DatabasesMainView = () => {
  const {
    rows,
    cols,
    columnsOrder,
    isSuccess,
    isError,
    isLoading,
    isFetching,
  } = useDatabases(({ state, query }) => {
    return {
      rows: state.rows,
      cols: state.cols,
      columnsOrder: state.columnsOrder,
      isSuccess: query.isSuccess,
      isError: query.isError,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
    };
  });

  const viewRows: ViewRow<SqlRow>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: idx,
    }));
  }, [rows]);

  const isBusy = isFetching;
  return (
    <>
      {isBusy && <ScreenLoader />}
      {isSuccess &&
        (rows.length > 0 ? (
          <DatabasesList
            rows={viewRows}
            cols={cols as SqlColumnsShape}
            columnsOrder={columnsOrder as string[]}
          />
        ) : (
          <EmptyPage note='No Databases found' />
        ))}
    </>
  );
};
