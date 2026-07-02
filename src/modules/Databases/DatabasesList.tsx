import { useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { dbApi } from '>/services/api';
import {
  useDeleteDatabasesMutation,
  useSelectDatabaseWrap,
} from '>/services/queryHooks';
import {
  useConfigStore,
  useDatabasesStore,
  messageStoreActions,
  createFactoryTableStore,
  dialogStoreActions,
  accountStoreActions,
} from '>/services/stores';
import {
  getColumnsFromRow,
  getSingleColumnFromResult,
  createFileSaveUrl,
  dialogActions,
  makeColumnsActive,
} from '>/services/utils';
import {
  ScreenLoader,
  EffectiveTableWrapper,
  SqlTableContainer,
  PageTableShell,
  DatabaseEdit,
  DialogContent,
  FilterColumns,
  dialogFactories,
} from '>/modules';
import { routes } from '>/config/routes';
import type {
  ViewRow,
  SqlColumnsShape,
  SqlRow,
  ScalarObject,
  CommonDialogHandlers,
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
};

export const DatabasesList = ({
  cols,
  rows,
  columnsOrder,
}: DatabasesListProps) => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const tableStore = useMemo(() => createFactoryTableStore(), []);
  const rowMap = useMemo(
    () => new Map(rows.map((r) => [r.uiKey, r.row])),
    [rows],
  );

  const { hiddenColumns } = useConfigStore(({ state }) => ({
    hiddenColumns: state.hiddenColumns,
  }));

  const { editedRow, markEditedRow } = useDatabasesStore(({ state, api }) => ({
    editedRow: state.editedRow as Record<number, ScalarObject>,
    markEditedRow: api.markEditedRow,
  }));

  const deleteDatabasesCallbacks = {
    onSuccess: (data: DeleteDatabasesResponse) => {
      tableStore.api.clearSelected();
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
    mutate: mutateDabaseSelection,
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

  const discardEditedRows = () => {
    dialogStoreActions.openDialog({
      payload: {
        caption: 'SQL Edits',
        variant: 'warn',
        component: (
          <DialogContent note='Discard Changes'>
            {'About to discard all changes made. Are you sure?'}
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
      field: 'SCHEMA_NAME',
    });
    const rsp = await dbApi.exportDatabases({ databases });
    const disposition = rsp.headers['content-disposition'];
    const match = disposition?.match(/filename="(.+)"/);
    const filename = match?.[1] ?? 'export.sql.gz';
    createFileSaveUrl(rsp.data, filename);
    tableStore.api.clearSelected();
    // console.log('response confirmSelectedExports', rsp);
  };

  const handleConfirmSelectedExports = () => {
    const sRows = tableStore.get().selectedRows;
    if (sRows.size === 0) {
      tableStore.api.setAllRows(rows);
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
    const sRows = tableStore.get().selectedRows;
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
      field: 'SCHEMA_NAME',
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
      fields: ['SCHEMA_NAME'],
    });
    if (typeof fields['SCHEMA_NAME'] !== 'string') return;
    mutateDabaseSelection({ database: fields['SCHEMA_NAME'] });
    navigate(routes.front.listTables);
  };

  const onEditRow = (uid: string) => {
    const row = rowMap.get(uid);
    if (!row) return;
    const fields = getColumnsFromRow({
      row,
      columnsOrder,
      fields: [
        'SCHEMA_NAME',
        'DEFAULT_CHARACTER_SET_NAME',
        'DEFAULT_COLLATION_NAME',
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

  const shellHandlers = {
    onCreate: handleCreateDatabase,
    onDiscardEdits:
      Object.entries(editedRow).length > 0 ? discardEditedRows : undefined,
    onDelete: handleDeleteDatabases,
    onDownload: handleConfirmSelectedExports,
    onFilterColumns: () => {
      makeColumnsActive(columnsOrder);
    },
  };

  const activeCols = columnsOrder.filter((c) => !hiddenColumns[c]);

  const isBusy = isPending || isDatabaseSelectionPending;
  if (isBusy) return <ScreenLoader />;

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
        <SqlTableContainer
          cols={cols}
          rows={rows}
          columnsOrder={columnsOrder}
          activeCols={activeCols}
          store={tableStore}
          outerRef={outerRef}
          tableRef={tableRef}
          resizeLineRef={resizeLineRef}
          editedRow={editedRow}
          onEditRow={onEditRow}
          onSelectRow={onSelectRow}
        />
      </EffectiveTableWrapper>
    </>
  );
};
