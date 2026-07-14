import { useMemo, useEffect } from 'react';
import { useDatabases } from '>/services/queryHooks';
import { getColumnsFromRow } from '>/services/utils';
import { ScreenLoader, EmptyPage } from '>/modules';
import { createFactoryTableStore, useAccountStore } from '>/services/stores';
import { SqlColumnsShape, SqlRow, ViewRow } from '>/types';
import { DatabasesList } from './DatabasesList';

export const DatabasesMainView = () => {
  const dbSelected = useAccountStore(({ state }) => state.dbSelected);
  const tableStore = useMemo(
    () => createFactoryTableStore({ listingType: 'dbRows' }),
    [],
  );
  const { cPaging } = tableStore.useFactoryTableStore(({ state }) => ({
    cPaging: state.paging,
  }));

  const {
    rows,
    cols,
    columnsOrder,
    responsePaging,
    isSuccess,
    isError,
    isLoading,
    isFetching,
  } = useDatabases(
    {
      paging: {
        limit: cPaging.limit,
        offset: cPaging.offset,
      },
    },
    ({ state, query }) => {
      return {
        rows: state.rows,
        cols: state.cols,
        columnsOrder: state.columnsOrder,
        responsePaging: state.paging,
        isSuccess: query.isSuccess,
        isError: query.isError,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
      };
    },
  );

  const viewRows: ViewRow<SqlRow>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: idx.toString(),
    }));
  }, [rows]);

  const uidSelected = useMemo(() => {
    if (!dbSelected) return undefined;

    for (const row of viewRows) {
      const { SCHEMA_NAME } = getColumnsFromRow({
        row: row.row,
        columnsOrder,
        fields: ['SCHEMA_NAME'],
      });

      if (SCHEMA_NAME === dbSelected) {
        return row.uiKey;
      }
    }

    return undefined;
  }, [dbSelected, viewRows, columnsOrder]);

  useEffect(() => {
    if (!isSuccess) return;

    tableStore.api.setPaging({
      hasNext: responsePaging?.hasNext ?? false,
      hasPrevious: responsePaging?.hasPrevious ?? false,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious]);

  const isBusy = isFetching;
  if (isBusy) return <ScreenLoader />;

  return (
    <>
      {rows.length > 0 ? (
        <DatabasesList
          rows={viewRows}
          cols={cols as SqlColumnsShape}
          columnsOrder={columnsOrder as string[]}
          store={tableStore}
          uidSelected={uidSelected}
        />
      ) : (
        <EmptyPage note='No Databases found' />
      )}
    </>
  );
};
