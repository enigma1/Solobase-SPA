import { useEffect, useMemo } from 'react';
import {
  useAccountStore,
  tablesDataStoreActions,
  dialogStoreActions,
  createFactoryTableStore,
} from '>/services/stores';
import { useTables } from '>/services/queryHooks';
import { getColumnsFromRow, databaseFields } from '>/services/utils';
import { EmptyPage, ScreenLoader, dialogFactories } from '>/modules';
import type { ViewRow, SqlRow } from '>/types';
import { TablesList } from './TablesList';

export const TablesMainView = () => {
  const { dbSelected, activeTable } = useAccountStore(({ state }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
  }));

  const tableStore = useMemo(
    () => createFactoryTableStore({ listingType: 'tableRows' }),
    [dbSelected],
  );
  const { cPaging, clearSelected } = tableStore.useFactoryTableStore(
    ({ state, api }) => ({
      cPaging: state.paging,
      clearSelected: api.clearSelected,
    }),
  );

  const {
    rows,
    cols,
    columnsOrder,
    responsePaging,
    isSuccess,
    isError,
    isFetching,
  } = useTables(
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
        isFetching: query.isFetching,
        isFetched: query.isFetched,
      };
    },
  );

  const viewRows: ViewRow<SqlRow>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: (cPaging.offset + idx).toString(),
    }));
  }, [rows]);

  const uidSelected = useMemo(() => {
    if (!dbSelected) return undefined;

    for (const row of viewRows) {
      const { TABLE_NAME } = getColumnsFromRow({
        row: row.row,
        columnsOrder,
        fields: [databaseFields.table],
      });

      if (TABLE_NAME === activeTable) {
        return row.uiKey;
      }
    }

    return undefined;
  }, [dbSelected, viewRows, columnsOrder]);

  useEffect(() => {
    if (!dbSelected || !activeTable) {
      tablesDataStoreActions.initialize();
    }
    clearSelected();
  }, [dbSelected, activeTable]);

  useEffect(() => {
    tableStore.api.setPaging({
      offset: 0,
    });
  }, [dbSelected]);

  useEffect(() => {
    if (!isSuccess) return;

    tableStore.api.setPaging({
      hasNext: responsePaging?.hasNext ?? false,
      hasPrevious: responsePaging?.hasPrevious ?? false,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious]);

  const handleCreateTable = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createTable(dbSelected),
    });
  };

  const isBusy = !isSuccess && isFetching;
  if (isBusy) return <ScreenLoader />;

  if (!dbSelected || rows.length === 0) {
    return (
      <EmptyPage
        onCreate={handleCreateTable}
        note={`${dbSelected ? 'No Tables in database [' + dbSelected + ']' : 'No database selected'}`}
      />
    );
  }

  return (
    <TablesList
      dbSelected={dbSelected}
      rows={viewRows}
      cols={cols}
      columnsOrder={columnsOrder}
      store={tableStore}
      uidSelected={uidSelected}
    />
  );
};
