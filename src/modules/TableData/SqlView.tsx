import { useState, useEffect, useRef, useMemo } from 'react';
import { queryClient } from '>/config/reactQuery';
import {
  useAccountStore,
  useTablesDataStore,
  useMessageStore,
  useDialogStore,
  createUiTableStore,
} from '>/services/stores';
import {
  Scalar,
  ScalarObject,
  SqlColumnsShape,
  SqlRow,
} from '>/types/dbTables';
import {
  TableContainer,
  DialogRenderer,
  EffectiveTableWrapper,
  ScreenLoader,
  PageTableShell,
} from '>/modules';
import { tableDataDialogMap } from './DialogMap';
import {
  MutationCallbacks,
  queryKeys,
  useUpdateRowsMutation,
} from '>/services/queryHooks';
import { updateRowsSqlTransformer } from './helpers';
import { isObjectEmpty, getMergedColumnData } from '>/services/utils';
import { ViewRow } from '>/types/common';
import {
  UpdateRowsRequest,
  UpdateRowsResponse,
} from '>/services/api/dbApiTypes';

type TableViewProps = {
  rows: ViewRow<SqlRow>[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
  dbSelected: string;
  activeTable: string;
};

export const SqlView = ({
  cols,
  rows,
  columnsOrder,
  dbSelected,
  activeTable,
}: TableViewProps) => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const tableStore = useMemo(() => createUiTableStore(), []);
  const addMessage = useMessageStore(({ api }) => api.addMessage);
  const { editedRow, markEditedRow } = useTablesDataStore(({ state, api }) => ({
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
    onSuccess: () => {
      // Remove rows from query cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.rows(dbSelected, activeTable),
      });
      // reset local edited state if provided
      markEditedRow({});
      addMessage({
        type: 'success',
        content: { text: `Rows saved successfully`, duration: 3000 },
      });
    },

    onError: (error) => {
      addMessage({
        content: { text: `Failed to save SQL changes`, duration: 5000 },
      });
    },
  } as MutationCallbacks<UpdateRowsResponse, UpdateRowsRequest>;

  const { mutate, isPending, isError, isSuccess } = useUpdateRowsMutation(
    ({ api, query }) => ({
      isPending: query.isPending,
      isError: query.isError,
      isSuccess: query.isSuccess,
      mutate: api.mutate,
    }),
    callbacks,
  );

  const handleDoubleClick = ({
    row,
    rId,
    cId,
    colName,
  }: {
    row: Scalar[];
    rId: number;
    cId: number;
    colName: string;
  }) => {
    openDialog({
      type: 'editCell',
      payload: {
        row,
        cId,
        rId,
        colName,
        onSave: (newValue: Scalar) => {
          closeDialog();
          markEditedRow((previousState) => {
            const prevRow =
              (previousState as Record<number, ScalarObject>)[rId] || {};
            const updatedRow = { ...prevRow };
            updatedRow[cId] = newValue;
            return {
              ...previousState,
              [rId]: updatedRow,
            };
          });
        },
      },
    });
  };

  const discardRow = (rowId: number) => {
    const { [rowId]: _, ...prevState } = editedRow;
    markEditedRow(prevState);
  };

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

  const handleDownloadTable = () => {};

  const handleSaveRows = () => {
    const rowsTransformed = updateRowsSqlTransformer({
      componentShape: editedRow,
      cols,
      table: activeTable,
      originalRows: rows.map((r) => r.row) as SqlRow[],
    });
    mutate(rowsTransformed);
  };

  const handleDeleteRows = () => {
    const selRows = tableStore.get().selectedRows;
  };

  const handleSelectedExports = () => {
    const selRows = tableStore.get().selectedRows;
  };

  // Filter Columns
  const handleColumnsActive = () => {
    openDialog({
      type: 'filterColumns',
      payload: {
        columns: columnsOrder,
        onSave: (newOrder: string[]) => {
          closeDialog();
          // setColumnsOrder(newOrder);
        },
      },
    });
  };

  const shellHandlers = {
    onExport: handleSelectedExports,
    onDiscardEdits: discardEditedRows,
    onDelete: handleDeleteRows,
    onSave: handleSaveRows,
    onFilterColumns: handleColumnsActive,
  };

  // useEffect(() => {
  //   console.log('TableView MOUNT');

  //   return () => {
  //     console.log('TableView UNMOUNT');
  //   };
  // }, []);

  return (
    <>
      <PageTableShell
        store={tableStore}
        tableRef={tableRef}
        title={`${activeTable} ${rows.length}`}
        actions={shellHandlers}
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
          onEditCell={handleDoubleClick}
          editedRow={editedRow}
        />
      </EffectiveTableWrapper>
      {isPending && <ScreenLoader />}
      <DialogRenderer
        dialog={dialog}
        onClose={closeDialog}
        map={tableDataDialogMap}
      />
    </>
  );
};
