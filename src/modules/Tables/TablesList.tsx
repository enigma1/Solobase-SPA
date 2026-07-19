import { useRef, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeleteTablesMutation } from '>/services/queryHooks';
import {
  useConfigStore,
  useTablesStore,
  useDialogStore,
  messageStoreActions,
  dialogStoreActions,
  accountStoreActions,
  FactoryTableStore,
} from '>/services/stores';
import { dbApi } from '>/services/api/dbApi';
import {
  getSingleColumnFromResult,
  getColumnsFromRow,
  dialogActions,
  makeColumnsActive,
  createFileSaveUrl,
} from '>/services/utils';
import {
  PageTableShell,
  EffectiveTableWrapper,
  SqlTableContainer,
  ScreenLoader,
  DialogContent,
  dialogFactories,
  TablesExportPreview,
} from '>/modules';
import { routes } from '>/config';
import type { DeleteTablesResponse } from '>/services/api/dbApiTypes';
import type {
  SqlColumnsShape,
  SqlRow,
  SqlObject,
  ViewRow,
  PagingContext,
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

  const { paging } = store.useFactoryTableStore(({ state }) => ({
    paging: state.paging,
  }));

  const { hiddenColumns, savePreferences, getPageSizes } = useConfigStore(
    ({ state, api }) => ({
      hiddenColumns: state.hiddenColumns,
      savePreferences: api.savePreferences,
      getPageSizes: api.getPageSizes,
    }),
  );

  const { editedRow, markEditedRow } = useTablesStore(({ state, api }) => ({
    editedRow: state.editedRow as Record<number, SqlObject>,
    markEditedRow: api.markEditedRow,
  }));

  const { dialog, openDialog, closeDialog } = useDialogStore(
    ({ api, state }) => ({
      dialog: state.dialog,
      openDialog: api.openDialog,
      closeDialog: api.closeDialog,
    }),
  );

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

  const discardEditedRows = () => {
    openDialog({
      payload: {
        caption: 'SQL Edits',
        component: (
          <DialogContent note='Discard Changes'>
            {'About to discard all changes made in the tables. Are you sure?'}
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

  const onSelectRow = (uid: string) => {
    const row = rowMap.get(uid);
    if (!row) return;
    const fields = getColumnsFromRow({
      row,
      columnsOrder,
      fields: ['TABLE_NAME'],
    });

    if (typeof fields['TABLE_NAME'] !== 'string') return;

    accountStoreActions.setActiveTable(fields['TABLE_NAME']);
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
        'TABLE_NAME',
        'ENGINE',
        'TABLE_COLLATION',
        'AUTO_INCREMENT',
        'ROW_FORMAT',
        'TABLE_COMMENT',
      ],
    });
    dialogStoreActions.openDialog({
      payload: dialogFactories.editTable({
        database: dbSelected,
        table: fields.TABLE_NAME,
      }),
    });
  };

  const handleCreateTable = () => {
    dialogStoreActions.openDialog({
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
      field: 'TABLE_NAME',
    });

    dialogStoreActions.openDialog({
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
            dialogStoreActions.closeDialog();
            mutate({
              database: dbSelected,
              tables: tableNames,
            });
          },
        }),
      },
    });
  };

  const confirmSelectedDownloads = async (entries: SqlRow[]) => {
    const tables = getSingleColumnFromResult({
      rows: entries,
      columnsOrder,
      field: 'TABLE_NAME',
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
    dialogStoreActions.openDialog({
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
            dialogStoreActions.closeDialog();
            confirmSelectedDownloads(entries);
          },
        }),
      },
    });
  };

  const handleBack = () => {
    navigate(routes.front.listDatabases, {
      replace: true,
    });
  };

  const shellHandlers = {
    onDiscardEdits:
      Object.entries(editedRow).length > 0 ? discardEditedRows : undefined,
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

  const activeCols = columnsOrder.filter((c) => !hiddenColumns[c]);

  const isBusy = isPending;
  if (isBusy) return <ScreenLoader />;

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
          selectedRow={uidSelected}
          editedRow={editedRow}
          onEditRow={onEditRow}
          onSelectRow={onSelectRow}
        />
      </EffectiveTableWrapper>
    </>
  );
};
