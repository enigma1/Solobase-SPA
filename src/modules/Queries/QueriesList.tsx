import { useEffect, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  dbApi,
  DeleteDatabasesRequest,
  ExportDatabasesRequest,
  ExportDatabasesResponse,
} from '>/services/api';
import {
  queryKeys,
  useDeleteDatabasesMutation,
  useDatabaseServerInfo,
} from '>/services/queryHooks';
import {
  useUtilitiesStore,
  useDatabasesStore,
  messageStoreActions,
  createFactoryTableStore,
  dialogStoreActions,
} from '>/services/stores';
import {
  getColumnsFromRow,
  getSingleColumnFromResult,
  createFileSaveUrl,
  dialogActions,
  makeColumnsActive,
} from '>/services/utils';
import {
  ViewRow,
  PrimeRow,
  SqlColumnsShape,
  SqlRow,
  ScalarObject,
} from '>/types';
import {
  ScreenLoader,
  EffectiveTableWrapper,
  SimpleTableContainer,
  PageTableShell,
  DatabaseEdit,
  DialogContent,
  FilterColumns,
} from '>/modules';

type QueriesListProps = {
  rows: ViewRow<PrimeRow>[];
  columnsOrder: string[];
};

export const QueriesList = ({ rows, columnsOrder }: QueriesListProps) => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const tableStore = useMemo(() => createFactoryTableStore(), []);

  const handleDeleteQueries = () => {};
  const handleCreateQueries = () => {};
  const onEditRow = () => {};

  const shellHandlers = {
    onCreate: handleCreateQueries,
    onDelete: handleDeleteQueries,
    // onFilterColumns: () => {
    //   makeColumnsActive(columnsOrder);
    // },
  };

  const activeCols = columnsOrder;
  return (
    <>
      <PageTableShell
        store={tableStore}
        title={`Databases: ${rows.length}`}
        tableRef={tableRef}
        actions={shellHandlers}
      />
      <EffectiveTableWrapper
        outerRef={outerRef}
        resizeLineRef={resizeLineRef}
        tableRef={tableRef}
      >
        <SimpleTableContainer
          rows={rows}
          columnsOrder={columnsOrder}
          activeCols={activeCols}
          store={tableStore}
          outerRef={outerRef}
          tableRef={tableRef}
          resizeLineRef={resizeLineRef}
          onEditRow={onEditRow}
        />
      </EffectiveTableWrapper>
    </>
  );
};
