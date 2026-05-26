import { useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useDeleteTablesMutation } from '>/services/queryHooks';
import {
  useAccountStore,
  useTablesStore,
  useDialogStore,
  messageStoreActions,
  createUiTableStore,
} from '>/services/stores';
import type { SqlColumnsShape, Scalar, ViewRow, ScalarObject } from '>/types';
import {
  PageTableShell,
  EffectiveTableWrapper,
  TableContainer,
  ScreenLoader,
  DialogRenderer,
  Checkbox,
} from '>/modules';
import { getMergedColumnData } from '>/services/utils';
import { tableDialogMap } from './DialogMap';

type TablesListProps = {
  rows: ViewRow<Scalar[]>[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
};

export const TablesList = ({ rows, cols, columnsOrder }: TablesListProps) => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const tableStore = useMemo(() => createUiTableStore(), []);
  const dbSelected = useAccountStore(({ state }) => state.dbSelected);

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
      if (data?.success) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.databases(),
          exact: true,
        });
      }
      messageStoreActions.addMessage({
        type: 'success',
        content: { text: 'Selected Databases removed', duration: 3000 },
      });
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to remove databases', duration: 3000 },
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
      type: 'discardChanges',
      payload: {
        caption: 'Discard Changes',
        message: 'Are you sure you want to discard all changes?',
        onConfirm: () => {
          closeDialog();
          markEditedRow({});
        },
        onCancel: () => closeDialog(),
      },
    });
  };

  const onDoubleClick = () => {};
  const handleSelectedExports = () => {};
  const handleSaveRows = () => {};
  const handleDeleteTables = () => {};
  const handleColumnsActive = () => {};

  const shellHandlers = {
    onExport: handleSelectedExports,
    onDiscardEdits: discardEditedRows,
    onDelete: handleDeleteTables,
    onDownload: handleSelectedExports,
    onSave: handleSaveRows,
    onFilterColumns: handleColumnsActive,
  };

  return (
    <>
      <PageTableShell
        store={tableStore}
        tableRef={tableRef}
        actions={shellHandlers}
        title={`Tables in ${dbSelected}`}
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
          store={tableStore}
          outerRef={outerRef}
          tableRef={tableRef}
          onEditCell={onDoubleClick}
          editedRow={editedRow}
        />
      </EffectiveTableWrapper>
      {isPending && <ScreenLoader />}
      <DialogRenderer
        dialog={dialog}
        onClose={closeDialog}
        map={tableDialogMap}
      />
    </>
  );
};
