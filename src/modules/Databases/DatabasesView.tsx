import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { routes } from '>/config';
import { aStub, isObjectEmpty } from '>/services/utils';
import { useColumnResize } from '>/services/hooks';
import {
  queryKeys,
  useDatabases,
  useDatabaseServerInfo,
} from '>/services/queryHooks';
import {
  messageStoreActions,
  useDialogStore,
  useAccountStore,
} from '>/services/stores';
import {
  dbApi,
  CreateDatabaseRequest,
  DeleteDatabasesRequest,
} from '>/services/api';
import { SqlColumnsShape, SqlRow } from '>/types';
import { DialogRenderer, ScreenLoader, EmptyPage } from '>/modules';
import { queryClient } from '>/config/reactQuery';
import { DatabasesList } from './DatabasesList';
import { dbDialogMap } from './DialogMap';

type ViewRow<T> = {
  row: T;
  uiKey: number;
};

export const DatabasesMainView = () => {
  const {
    collationsByCharset,
    defaults,
    isLoading: isInfoLoading,
    isSuccess: isInfoSuccess,
  } = useDatabaseServerInfo(({ state, query }) => ({
    collationsByCharset: state.collationsByCharset,
    defaults: state.defaults,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
  }));

  const { rows, cols, columnsOrder, isSuccess, isError, isLoading } =
    useDatabases(({ state, query }) => {
      return {
        rows: state.rows,
        cols: state.cols,
        columnsOrder: state.columnsOrder,
        isSuccess: query.isSuccess,
        isError: query.isError,
        isLoading: query.isLoading,
      };
    });

  // useEffect(() => {
  //   queryClient.invalidateQueries({
  //     queryKey: queryKeys.databases(),
  //     exact: true,
  //   });
  // }, []);

  const viewRows: ViewRow<SqlRow>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: idx,
    }));
  }, [rows]);

  return (
    <>
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
      {isLoading && <ScreenLoader />}
    </>
  );
};
