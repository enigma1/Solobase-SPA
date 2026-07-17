import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableData } from '>/services/queryHooks';
import {
  useAccountStore,
  tablesDataStoreActions,
  dialogStoreActions,
  createFactoryTableStore,
} from '>/services/stores';
import { routes } from '>/config';
import {
  DataRowsList,
  ScreenLoader,
  EmptyListing,
  dialogFactories,
} from '>/modules';
import { SqlColumnsShape, SqlRow, ViewRow } from '>/types';

export const TableDataView = () => {
  const navigate = useNavigate();
  const tableStore = useMemo(
    () => createFactoryTableStore({ listingType: 'dataRows' }),
    [],
  );
  const { cPaging } = tableStore.useFactoryTableStore(({ state }) => ({
    cPaging: state.paging,
  }));

  const { dbSelected, activeTable } = useAccountStore(({ state, api }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
  }));

  const {
    rows,
    cols,
    columnsOrder,
    rowTokens,
    responsePaging,
    isSuccess,
    isFetching,
  } = useTableData(
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
        rowTokens: state.rowTokens,
        responsePaging: state.paging,
        isSuccess: query.isSuccess,
        isError: query.isError,
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

  useEffect(() => {
    tablesDataStoreActions.initialize();
  }, [dbSelected, activeTable]);

  useEffect(() => {
    if (!isSuccess) return;

    tableStore.api.setPaging({
      hasNext: responsePaging?.hasNext ?? false,
      hasPrevious: responsePaging?.hasPrevious ?? false,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious]);

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

  const onBack = () => {
    navigate(routes.front.listTables, {
      replace: true,
    });
  };

  if (rows.length === 0) {
    return (
      <EmptyListing
        onCreate={onCreate}
        onBack={onBack}
        note={`No available rows in ${activeTable}`}
      />
    );
  }

  return (
    <DataRowsList
      rows={viewRows as ViewRow<SqlRow>[]}
      rowTokens={rowTokens}
      cols={cols as SqlColumnsShape}
      columnsOrder={columnsOrder}
      activeTable={activeTable}
      dbSelected={dbSelected}
      store={tableStore}
    />
  );
};
