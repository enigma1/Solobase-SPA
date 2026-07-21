import { useEffect, useRef, useMemo } from 'react';
import { getAppConfig, getPrefs } from '>/config';
import { useSavePreferencesWrap } from '>/services/queryHooks';
import {
  createFactoryTableStore,
  dialogStoreActions,
  configStoreActions,
  historyStoreActions,
  queriesStoreActions,
  useQueriesStore,
} from '>/services/stores';
import { dialogActions } from '>/services/utils';
import {
  ScreenLoader,
  EffectiveTableWrapper,
  SimpleTableContainer,
  PageTableShell,
  EmptyListing,
  dialogFactories,
} from '>/modules';
import { QueriesDeletePreview } from './QueriesPreviews';

export const QueriesList = () => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const tableStore = useMemo(
    () => createFactoryTableStore({ listingType: 'queryRows' }),
    [],
  );

  const { mutate, isPending } = useSavePreferencesWrap();

  const { queries, getQueriesCount, removeQueries } = useQueriesStore(
    ({ state, api }) => ({
      removeQueries: api.removeQueries,
      getQueriesCount: api.getQueriesCount,
      queries: state.queries,
    }),
  );

  const columnsOrder = ['title', 'query', 'database'];
  const rows = Object.values(queries)
    .filter((q) => q.title !== '')
    .map((q, idx) => {
      return {
        row: [q.title, q.query, q.database ?? 'N/A'],
        uiKey: q.title,
      };
    });

  const rowMap = useMemo(
    () => new Map(rows.map((r) => [r.uiKey, r.row])),
    [rows],
  );

  const handleCreateQuery = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.makeQuery(),
    });
  };

  const handleDeleteQueries = () => {
    if (getQueriesCount() === 0) return;

    const sRows = tableStore.get().selectedRows;
    if (sRows.size === 0) {
      return;
    }

    const originalRows = [...sRows].map((key) => rowMap.get(key)!);

    dialogStoreActions.openDialog({
      payload: {
        caption: 'SQL Queries',
        variant: 'warn',
        component: (
          <QueriesDeletePreview
            rows={originalRows}
            columnsOrder={columnsOrder}
          />
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            dialogStoreActions.closeDialog();
            removeQueries([...sRows]);
            const userPrefs = {
              ...getPrefs(),
              queries: queriesStoreActions.getQueries(),
            };
            mutate({
              version: getAppConfig().appInfo.storageVersion,
              userPrefs,
            });
            tableStore.api.clearSelected();
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
      {isPending && <ScreenLoader />}
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
