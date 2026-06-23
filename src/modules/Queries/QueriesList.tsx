import { useEffect, useRef, useMemo } from 'react';
import { dbApi } from '>/services/api';
import {
  createFactoryTableStore,
  dialogStoreActions,
  useQueriesStore,
} from '>/services/stores';
import {
  ScreenLoader,
  EffectiveTableWrapper,
  SimpleTableContainer,
  PageTableShell,
  EmptyListing,
  dialogFactories,
} from '>/modules';
import { dialogActions } from '>/services/utils';
import { QueriesDeletePreview } from './QueriesPreviews';

export const QueriesList = () => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const tableStore = useMemo(() => createFactoryTableStore(), []);
  const { queries, getQueriesCount } = useQueriesStore(({ state, api }) => ({
    getQueriesCount: api.getQueriesCount,
    queries: state.queries,
  }));

  const columnsOrder = ['title', 'query', 'database'];
  const rows = Object.values(queries).map((q, idx) => {
    return {
      row: [q.title, q.query, q.database ?? 'N/A'],
      uiKey: q.title,
    };
  });

  const handleCreateQuery = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.makeQuery(),
    });
  };

  const handleDeleteQueries = () => {
    if (getQueriesCount() === 0) return;

    dialogStoreActions.openDialog({
      payload: {
        caption: 'SQL Queries',
        variant: 'warn',
        component: (
          <QueriesDeletePreview
            rows={rows.map((r) => r.row)}
            columnsOrder={columnsOrder}
          />
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            dialogStoreActions.closeDialog();
          },
        }),
      },
    });
  };

  const onEditRow = (id: string) => {
    if (!queries[id]) return;
    dialogStoreActions.openDialog({
      payload: dialogFactories.editQuery(queries[id].title),
    });
  };

  const shellHandlers = {
    onCreate: handleCreateQuery,
    onDelete: handleDeleteQueries,
    // onFilterColumns: () => {
    //   makeColumnsActive(columnsOrder);
    // },
  };

  const activeCols = columnsOrder;

  if (rows.length === 0) {
    return (
      <EmptyListing
        onCreate={handleCreateQuery}
        note={`No queries are currently set`}
      />
    );
  }

  return (
    <>
      <PageTableShell
        store={tableStore}
        title={`Queries: ${rows.length}`}
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
