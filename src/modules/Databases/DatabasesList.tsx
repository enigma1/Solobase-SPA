import { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbApi } from '>/services/api';
import { filterDatabaseActionOptions } from '>/config';
import {
  useDeleteDatabasesMutation,
  useSelectDatabaseWrap,
} from '>/services/queryHooks';
import {
  useAccountStore,
  useConfigStore,
  messageStoreActions,
  dialogStoreActions,
  FactoryTableStore,
  useColumnsStore,
} from '>/services/stores';
import {
  getColumnsFromRow,
  getSingleColumnFromResult,
  createFileSaveUrl,
  dialogActions,
  makeColumnsActive,
  databaseFields,
  buildColumnActions,
} from '>/services/utils';
import {
  ScreenLoader,
  EffectiveTableWrapper,
  SqlTableContainer,
  PageTableShell,
  DatabaseEdit,
  DialogContent,
  dialogFactories,
  EditDataCellRaw,
} from '>/modules';
import { routes } from '>/config/routes';
import type {
  ViewRow,
  SqlColumnsShape,
  SqlRow,
  CommonDialogHandlers,
  PagingContext,
  ColumnActions,
  ActionColumnProps,
} from '>/types';
import type { DeleteDatabasesResponse } from '>/services/api/dbApiTypes';
import {
  DatabaseExportPreview,
  DatabasesDeletePreview,
} from './DatabasesPreviews';

type DatabasesListProps = {
  rows: ViewRow<SqlRow>[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
  store: FactoryTableStore;
  uidSelected?: string;
};

export const DatabasesList = ({
  cols,
  rows,
  columnsOrder,
  store,
  uidSelected,
}: DatabasesListProps) => {
  const navigate = useNavigate();

  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  const dbSelected = useAccountStore(({ state }) => state.dbSelected);
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

  const { savePreferences, getPageSizes } = useConfigStore(
    ({ state, api }) => ({
      savePreferences: api.savePreferences,
      getPageSizes: api.getPageSizes,
    }),
  );

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

  const deleteDatabasesCallbacks = {
    onSuccess: (data: DeleteDatabasesResponse) => {
      store.api.clearSelected();
      if (data.ok) {
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: 'Selected Databases removed', duration: 3000 },
        });
      } else {
        messageStoreActions.addMessage({
          type: 'warn',
          content: {
            text: data.message ?? 'Not all databases were removed',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to remove databases', duration: 3000 },
      });
    },
  };

  const {
    mutate: mutateDatabaseSelection,
    isPending: isDatabaseSelectionPending,
  } = useSelectDatabaseWrap();

  const { mutate, isPending, response } = useDeleteDatabasesMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    deleteDatabasesCallbacks,
  );

  // ----------------
  // No-Hooks Section
  // ----------------
  const discardSelectedRows = () => {
    dialogStoreActions.openDialog({
      payload: {
        caption: 'SQL Edits',
        variant: 'warn',
        component: (
          <DialogContent note='Discard Changes'>
            {'About to discard all selectied rows. Are you sure?'}
          </DialogContent>
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            dialogStoreActions.closeDialog();
            markEditedRow({});
          },
        }),
      },
    });
  };

  const confirmSelectedExports = async (dbEntries: SqlRow[]) => {
    const databases = getSingleColumnFromResult({
      rows: dbEntries,
      columnsOrder,
      field: databaseFields.name,
    });
    const rsp = await dbApi.exportDatabases({ databases });
    const disposition = rsp.headers['content-disposition'];
    const match = disposition?.match(/filename="(.+)"/);
    const filename = match?.[1] ?? 'export.sql.gz';
    createFileSaveUrl(rsp.data, filename);
    store.api.clearSelected();
  };

  const handleConfirmSelectedExports = () => {
    const sRows = store.get().selectedRows;
    if (sRows.size === 0) {
      store.api.setAllRows(rows);
      return;
    }

    const rowMap = new Map(rows.map((r) => [r.uiKey, r.row]));
    const dbEntries: SqlRow[] = [];

    for (const id of sRows) {
      const row = rowMap.get(id);
      if (row) dbEntries.push(row);
    }
    dialogStoreActions.openDialog({
      payload: {
        caption: 'Export Databases',
        variant: 'info',
        component: (
          <DatabaseExportPreview rows={dbEntries} columnsOrder={columnsOrder} />
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            dialogStoreActions.closeDialog();
            confirmSelectedExports(dbEntries);
          },
        }),
      },
    });
  };

  const handleCreateDatabase = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createDatabase(),
    });
  };

  const handleDeleteDatabases = () => {
    const sRows = store.get().selectedRows;
    if (sRows.size === 0) {
      return;
    }

    const dbEntries: SqlRow[] = [];

    for (const id of sRows) {
      const row = rowMap.get(id);
      if (row) dbEntries.push(row);
    }
    const dbNames = getSingleColumnFromResult({
      rows: dbEntries,
      columnsOrder,
      field: databaseFields.name,
    });

    dialogStoreActions.openDialog({
      payload: {
        caption: 'Removal of Databases',
        variant: 'error',
        component: (
          <DatabasesDeletePreview
            rows={dbEntries}
            columnsOrder={columnsOrder}
          />
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            dialogStoreActions.closeDialog();
            mutate({ names: dbNames });
          },
        }),
      },
    });
  };

  const onSelectRow = (uid: string) => {
    const row = rowMap.get(uid);
    if (!row) return;
    const fields = getColumnsFromRow({
      row,
      columnsOrder,
      fields: [databaseFields.name],
    });
    const db = fields[databaseFields.name];
    if (typeof db !== 'string') return;
    mutateDatabaseSelection({ database: db });

    navigate(routes.front.listTables);
  };

  const onEditRow = (uid: string) => {
    const row = rowMap.get(uid);
    if (!row) return;
    const fields = getColumnsFromRow({
      row,
      columnsOrder,
      fields: [
        databaseFields.name,
        databaseFields.charset,
        databaseFields.collation,
      ],
    });
    const handlers: CommonDialogHandlers = {
      confirm: () => {},
    };
    const labels = [undefined, 'Update'];
    dialogStoreActions.openDialog({
      payload: {
        initialSize: 'lg',
        caption: 'Database Forms',
        variant: 'warn',
        component: (
          <DatabaseEdit
            formHandlers={handlers}
            name={fields.SCHEMA_NAME as string}
            charset={fields.DEFAULT_CHARACTER_SET_NAME as string}
            collation={fields.DEFAULT_COLLATION_NAME as string}
          />
        ),
        actions: dialogActions
          .enabledConfirmCancel({
            onConfirm: () => {
              handlers.confirm();
              dialogStoreActions.closeDialog();
            },
          })
          .map((control, idx) => ({
            ...control,
            label: labels[idx] ?? control.label,
          })),
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
      dialogStoreActions.openDialog({
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
              dialogStoreActions.closeDialog();
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

  const shellHandlers = {
    onCreate: handleCreateDatabase,
    onDiscardEdits:
      Object.entries(editedRow).length > 0 ? discardSelectedRows : undefined,
    onDelete: handleDeleteDatabases,
    onDownload: handleConfirmSelectedExports,
    onFilterColumns: () => {
      makeColumnsActive(columnsOrder);
    },
  };

  const getPagingContext = (): PagingContext => {
    // const showPagination = paging.hasNext || paging.hasPrevious;
    // if (!showPagination) return;

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
            dbRows: limit,
          },
        });
      },
    };
  };

  const isBusy = isPending || isDatabaseSelectionPending;
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
        title={`Databases: ${start}–${end}`}
        tableRef={tableRef}
        actions={shellHandlers}
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
          actionOptions={filterDatabaseActionOptions}
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
