import { useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeleteTablesMutation } from '>/services/queryHooks';
import {
  useConfigStore,
  useDialogStore,
  messageStoreActions,
  accountStoreActions,
  FactoryTableStore,
  useColumnsStore,
} from '>/services/stores';
import { dbApi } from '>/services/api/dbApi';
import {
  getSingleColumnFromResult,
  getColumnsFromRow,
  dialogActions,
  makeColumnsActive,
  createFileSaveUrl,
  databaseFields,
  buildColumnActions,
} from '>/services/utils';
import {
  PageTableShell,
  EffectiveTableWrapper,
  SqlTableContainer,
  ScreenLoader,
  DialogContent,
  dialogFactories,
  TablesExportPreview,
  EditDataCellRaw,
} from '>/modules';
import { routes, filterTableActionOptions } from '>/config';
import type { DeleteTablesResponse } from '>/services/api/dbApiTypes';
import type {
  SqlColumnsShape,
  SqlRow,
  ViewRow,
  PagingContext,
  ActionColumnProps,
  ColumnActions,
} from '>/types';

import { TablesDeletePreview } from './TablesPreviews';

type TablesListProps = {
  dbSelected: string;
  rows: ViewRow<SqlRow>[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
  store: FactoryTableStore;
  uidSelected?: string;
};

export const TablesList = ({
  dbSelected,
  rows,
  cols,
  columnsOrder,
  store,
  uidSelected,
}: TablesListProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const rowMap = useMemo(
    () => new Map(rows.map((r) => [r.uiKey, r.row])),
    [rows],
  );

  const {
    pastColumnsActions,
    hiddenColumns,
    getSortBy,
    getFilters,
    changeSortBy,
    changeFilter,
  } = useColumnsStore(({ state, api }) => ({
    pastColumnsActions: state.pastColumnsActions,
    hiddenColumns: state.hiddenColumns,
    getSortBy: api.getSortBy,
    changeSortBy: api.changeSortBy,
    changeFilter: api.changeFilter,
    getFilters: api.getFilters,
  }));

  const { filters, sortBy } = useMemo(
    () => ({
      filters: getFilters(cols),
      sortBy: getSortBy(cols),
    }),
    [cols, hiddenColumns, pastColumnsActions],
  );

  const { savePreferences, getPageSizes } = useConfigStore(({ api }) => ({
    savePreferences: api.savePreferences,
    getPageSizes: api.getPageSizes,
  }));

  const { paging, editedRow, markEditedRow } = store.useFactoryTableStore(
    ({ state, api }) => ({
      paging: state.paging,
      editedRow: state.editedRow,
      markEditedRow: api.markEditedRow,
    }),
  );

  const columnsActions = useMemo<Record<string, ColumnActions>>(
    () =>
      buildColumnActions({
        columnsOrder,
        cols,
        sortBy,
        filters,
      }),
    [columnsOrder, cols, sortBy, filters],
  );

  const { openDialog, closeDialog } = useDialogStore(({ api, state }) => ({
    dialog: state.dialog,
    openDialog: api.openDialog,
    closeDialog: api.closeDialog,
  }));

  const callbacks = {
    onSuccess: (data: DeleteTablesResponse) => {
      if (data.ok) {
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: 'Selected Tables removed', duration: 3000 },
        });
      } else {
        messageStoreActions.addMessage({
          type: 'warn',
          content: {
            text: data.message ?? 'Partial Failure removing tables',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to remove requested tables', duration: 3000 },
      });
    },
  };

  const { mutate, isPending, response } = useDeleteTablesMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    callbacks,
  );

  // ----------------
  // No-Hooks Section
  // ----------------
  const discardSelectedRows = () => {
    openDialog({
      payload: {
        caption: 'SQL Edits',
        component: (
          <DialogContent note='Clear Selected Rows'>
            {'About to clear selected tables in this database. Are you sure?'}
          </DialogContent>
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            closeDialog();
            markEditedRow({});
          },
        }),
      },
    });
  };

  const onSelectRow = async (uid: string) => {
    const row = rowMap.get(uid);
    if (!row) return;
    const fields = getColumnsFromRow({
      row,
      columnsOrder,
      fields: [databaseFields.table],
    });

    const tableName = fields[databaseFields.table];
    if (typeof tableName !== 'string') return;

    const allowed = await accountStoreActions.triggerGuard();
    if (!allowed) return;
    accountStoreActions.setActiveTable(tableName);

    if (location.pathname !== routes.front.listData) {
      navigate(routes.front.listData);
    }
  };

  const onEditRow = (uid: string) => {
    const row = rowMap.get(uid);
    if (!row) return;

    const fields = getColumnsFromRow({
      row,
      columnsOrder,
      fields: [
        databaseFields.table,
        databaseFields.engine,
        databaseFields.tCollation,
        databaseFields.autoInc,
        databaseFields.rowFormat,
        databaseFields.comment,
      ],
    });
    openDialog({
      payload: dialogFactories.editTable({
        database: dbSelected,
        table: fields.TABLE_NAME,
      }),
    });
  };

  const handleCreateTable = () => {
    openDialog({
      payload: dialogFactories.createTable(dbSelected),
    });
  };
  const handleDeleteTables = () => {
    const sRows = store.get().selectedRows;
    if (sRows.size === 0) {
      return;
    }

    const tableEntries: SqlRow[] = [];

    for (const id of sRows) {
      const row = rowMap.get(id);
      if (row) tableEntries.push(row);
    }
    const tableNames = getSingleColumnFromResult({
      rows: tableEntries,
      columnsOrder,
      field: databaseFields.table,
    });

    openDialog({
      payload: {
        caption: 'Removal of Tables',
        variant: 'error',
        component: (
          <TablesDeletePreview
            database={dbSelected}
            rows={tableEntries}
            columnsOrder={columnsOrder}
          />
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            closeDialog();
            mutate({
              database: dbSelected,
              tables: tableNames,
            });
            store.api.clearSelected();
          },
        }),
      },
    });
  };

  const confirmSelectedDownloads = async (entries: SqlRow[]) => {
    const tables = getSingleColumnFromResult({
      rows: entries,
      columnsOrder,
      field: databaseFields.table,
    });
    const rsp = await dbApi.exportTables({ database: dbSelected, tables });
    const disposition = rsp.headers['content-disposition'];
    const match = disposition?.match(/filename="(.+)"/);
    const filename = match?.[1] ?? 'exported-tables.sql.gz';
    createFileSaveUrl(rsp.data, filename);
    store.api.clearSelected();
  };

  const handleSelectedDownloads = () => {
    const sRows = store.get().selectedRows;
    if (sRows.size === 0) {
      store.api.setAllRows(rows);
      return;
    }

    const rowMap = new Map(rows.map((r) => [r.uiKey, r.row]));
    const entries: SqlRow[] = [];

    for (const id of sRows) {
      const row = rowMap.get(id);
      if (row) entries.push(row);
    }
    openDialog({
      payload: {
        caption: 'Export Tables',
        variant: 'info',
        component: (
          <TablesExportPreview
            database={dbSelected}
            rows={entries}
            columnsOrder={columnsOrder}
          />
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            closeDialog();
            confirmSelectedDownloads(entries);
          },
        }),
      },
    });
  };

  const handleColumnAction = (action: ActionColumnProps) => {
    const { colName, actions } = action;
    if (actions.sort) {
      changeSortBy({
        cols,
        colName,
        direction: actions.sort === 'both' ? undefined : actions.sort,
      });
    }

    if (!actions.filter) return;
    if (actions.filter.value === undefined) {
      changeFilter({
        cols,
        colName,
        filter: { value: actions.filter.value, mode: actions.filter.mode },
      });
    } else {
      const valueRef = { current: actions.filter.value };
      const modeRef = { current: actions.filter.mode };
      openDialog({
        payload: {
          caption: `SQL Edits`,
          variant: 'warn',
          component: (
            <DialogContent note={`${colName} @${cols[colName].type}`}>
              <EditDataCellRaw
                type={cols[colName].type}
                value={valueRef.current!}
                onChange={(v) => {
                  valueRef.current = v;
                }}
              />
            </DialogContent>
          ),
          actions: dialogActions.enabledConfirmCancel({
            onConfirm: () => {
              closeDialog();
              store.api.setPaging({ offset: 0 });
              changeFilter({
                cols,
                colName,
                filter: { value: valueRef.current, mode: modeRef.current },
              });
            },
          }),
        },
      });
    }
  };

  const handleBack = () => {
    navigate(routes.front.listDatabases, {
      replace: true,
    });
  };

  const shellHandlers = {
    onDiscardEdits:
      Object.entries(editedRow).length > 0 ? discardSelectedRows : undefined,
    onCreate: handleCreateTable,
    onDelete: handleDeleteTables,
    onDownload: handleSelectedDownloads,
    onFilterColumns: () => {
      makeColumnsActive(columnsOrder);
    },
    onBack: handleBack,
  };

  const getPagingContext = (): PagingContext => {
    return {
      hasNext: paging.hasNext,
      hasPrevious: paging.hasPrevious,
      currentSize: paging.limit,

      onNextPage: () => {
        store.api.setPaging({
          offset: paging.offset + paging.limit,
        });
      },

      onPreviousPage: () => {
        store.api.setPaging({
          offset: Math.max(0, paging.offset - paging.limit),
        });
      },

      onPageSize: (limit) => {
        store.api.setPaging({
          limit,
          offset: 0,
        });
        const pageSizes = getPageSizes();
        savePreferences({
          pageSizes: {
            ...pageSizes,
            tableRows: limit,
          },
        });
      },
    };
  };

  const isBusy = isPending;
  if (isBusy) return <ScreenLoader />;

  const activeCols = columnsOrder.filter((c) => !hiddenColumns[c]);
  const hasHiddenColumns = columnsOrder.some((col) => hiddenColumns[col]);
  const pagingContext = getPagingContext();
  const start = paging.offset + 1;
  const end = paging.offset + rows.length;

  return (
    <>
      <PageTableShell
        store={store}
        tableRef={tableRef}
        actions={shellHandlers}
        title={`Tables of [${dbSelected}]: ${start}–${end}`}
        paging={pagingContext}
        indicators={{ hasHiddenColumns }}
      />
      <EffectiveTableWrapper
        outerRef={outerRef}
        resizeLineRef={resizeLineRef}
        tableRef={tableRef}
      >
        <SqlTableContainer
          cols={cols}
          rows={rows}
          columnsOrder={columnsOrder}
          activeCols={activeCols}
          store={store}
          outerRef={outerRef}
          tableRef={tableRef}
          resizeLineRef={resizeLineRef}
          filters={filters}
          actionOptions={filterTableActionOptions}
          columnActions={columnsActions}
          onActionCol={handleColumnAction}
          selectedRow={uidSelected}
          editedRow={editedRow}
          onEditRow={onEditRow}
          onSelectRow={onSelectRow}
        />
      </EffectiveTableWrapper>
    </>
  );
};
