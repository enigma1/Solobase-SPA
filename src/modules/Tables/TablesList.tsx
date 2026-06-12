import { useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useDeleteTablesMutation } from '>/services/queryHooks';
import {
  useUtilitiesStore,
  useTablesStore,
  useDialogStore,
  messageStoreActions,
  createUiTableStore,
  dialogStoreActions,
} from '>/services/stores';
import type {
  SqlColumnsShape,
  Scalar,
  SqlRow,
  ViewRow,
  ScalarObject,
} from '>/types';
import {
  PageTableShell,
  EffectiveTableWrapper,
  TableContainer,
  ScreenLoader,
  Checkbox,
  DialogContent,
  dialogFactories,
} from '>/modules';
import {
  getSingleColumnFromResult,
  getColumnsFromResult,
  getColumnsFromRow,
  getMergedColumnData,
  dialogActions,
  makeColumnsActive,
} from '>/services/utils';
import { TableEdit } from './TableEdit';
import { TablesDeletePreview } from './TablesPreviews';

type TablesListProps = {
  dbSelected: string;
  rows: ViewRow<Scalar[]>[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
};

export const TablesList = ({
  dbSelected,
  rows,
  cols,
  columnsOrder,
}: TablesListProps) => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const tableStore = useMemo(() => createUiTableStore(), []);
  const rowMap = useMemo(
    () => new Map(rows.map((r) => [r.uiKey, r.row])),
    [rows],
  );

  const { hiddenColumns } = useUtilitiesStore(({ state }) => ({
    hiddenColumns: state.hiddenColumns,
  }));

  const { editedRow, markEditedRow } = useTablesStore(({ state, api }) => ({
    editedRow: state.editedRow as Record<number, ScalarObject>,
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
    onSuccess: (data: any) => {
      if (data.ok) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.databases(),
          exact: true,
        });

        messageStoreActions.addMessage({
          type: 'success',
          content: { text: 'Selected Rows removed', duration: 3000 },
        });
      } else {
        messageStoreActions.addMessage({
          type: 'warn',
          content: {
            text: data.message ?? 'Failed to remove some data rows',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to remove data rows', duration: 3000 },
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

  const onEditRow = (uid: number) => {
    const row = rowMap.get(uid);
    if (!row) return;

    const fields = getColumnsFromRow(row, columnsOrder, [
      'TABLE_NAME',
      'ENGINE',
      'TABLE_COLLATION',
      'AUTO_INCREMENT',
      'ROW_FORMAT',
      'TABLE_COMMENT',
    ]);
    dialogStoreActions.openDialog({
      payload: dialogFactories.editTable({
        database: dbSelected,
        table: fields.TABLE_NAME,
      }),
    });
  };

  const handleSelectedExports = () => {};
  const handleSaveRows = () => {};
  const handleCreateTable = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createTable(dbSelected),
    });
  };
  const handleDeleteTables = () => {
    const sRows = tableStore.get().selectedRows;
    if (sRows.size === 0) {
      return;
    }

    const tableEntries: SqlRow[] = [];

    for (const id of sRows) {
      const row = rowMap.get(id);
      if (row) tableEntries.push(row);
    }
    const tableNames = getSingleColumnFromResult(
      tableEntries,
      columnsOrder,
      'TABLE_NAME',
    );

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

  const shellHandlers = {
    onDiscardEdits:
      Object.entries(editedRow).length > 0 ? discardEditedRows : undefined,
    onSave: Object.entries(editedRow).length > 0 ? handleSaveRows : undefined,
    onExport: handleSelectedExports,
    onCreate: handleCreateTable,
    onDelete: handleDeleteTables,
    onDownload: handleSelectedExports,
    onFilterColumns: () => {
      makeColumnsActive(columnsOrder);
    },
  };

  const activeCols = columnsOrder.filter((c) => !hiddenColumns[c]);

  const isBusy = isPending;
  if (isBusy) return <ScreenLoader />;

  return (
    <>
      <PageTableShell
        store={tableStore}
        tableRef={tableRef}
        actions={shellHandlers}
        title={`Tables in [${dbSelected}]`}
      />
      <EffectiveTableWrapper
        outerRef={outerRef}
        resizeLineRef={resizeLineRef}
        tableRef={tableRef}
      >
        <TableContainer
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
        />
      </EffectiveTableWrapper>
    </>
  );
};
