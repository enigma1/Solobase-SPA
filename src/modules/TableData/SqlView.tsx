import { useRef, useMemo } from 'react';
import { queryClient } from '>/config/reactQuery';
import {
  Scalar,
  ScalarObject,
  SqlColumnsShape,
  SqlRow,
  ViewRow,
} from '>/types';
import {
  useUtilitiesStore,
  useTablesDataStore,
  useMessageStore,
  createFactoryTableStore,
  dialogStoreActions,
} from '>/services/stores';
import {
  MutationCallbacks,
  queryKeys,
  useUpdateRowsMutation,
  useDeleteRowsMutation,
} from '>/services/queryHooks';
import { dialogActions, makeColumnsActive } from '>/services/utils';
import {
  SqlTableContainer,
  EffectiveTableWrapper,
  ScreenLoader,
  PageTableShell,
  DialogContent,
  FilterColumns,
  EditDataCellRaw,
  dialogFactories,
} from '>/modules';
import {
  UpdateDataRowsRequest,
  UpdateDataRowsResponse,
  DeleteDataRowsRequest,
  DeleteDataRowsResponse,
} from '>/services/api/dbApiTypes';
import { updateRowsSqlTransformer } from './helpers';
import { DataRowsDeletePreview } from './DataRowsPreview';

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
  const tableStore = useMemo(() => createFactoryTableStore(), []);
  const rowMap = useMemo(
    () => new Map(rows.map((r) => [r.uiKey, r.row])),
    [rows],
  );

  const { hiddenColumns } = useUtilitiesStore(({ state }) => ({
    hiddenColumns: state.hiddenColumns,
  }));

  const addMessage = useMessageStore(({ api }) => api.addMessage);
  const { editedRow, markEditedRow } = useTablesDataStore(({ state, api }) => ({
    editedRow: state.editedRow as Record<number, ScalarObject>,
    markEditedRow: api.markEditedRow,
  }));

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
  } as MutationCallbacks<UpdateDataRowsResponse, UpdateDataRowsRequest>;

  const { mutate, isPending, isError, isSuccess } = useUpdateRowsMutation(
    ({ api, query }) => ({
      isPending: query.isPending,
      isError: query.isError,
      isSuccess: query.isSuccess,
      mutate: api.mutate,
    }),
    callbacks,
  );

  const deleteCallbacks = {
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
  } as MutationCallbacks<DeleteDataRowsResponse, DeleteDataRowsRequest>;

  const {
    mutate: mutateDelete,
    isPending: isDeletePending,
    isError: isDeleteError,
    isSuccess: isDeleteSuccess,
  } = useDeleteRowsMutation(
    ({ api, query }) => ({
      isPending: query.isPending,
      isError: query.isError,
      isSuccess: query.isSuccess,
      mutate: api.mutate,
    }),
    deleteCallbacks,
  );

  const handleEditClick = ({
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
    const valueRef = { current: row[cId] };
    const saveChanges = (newValue: Scalar) => {
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
    };
    dialogStoreActions.openDialog({
      payload: {
        caption: `SQL Edits`,
        variant: 'warn',
        component: (
          <DialogContent note={`Table: ${colName} @row:[${rId}]`}>
            <EditDataCellRaw
              value={row[cId]}
              onChange={(v: Scalar) => (valueRef.current = v)}
            />
          </DialogContent>
        ),
        actions: dialogActions.enabledConfirmCancel({
          onConfirm: () => {
            dialogStoreActions.closeDialog();
            saveChanges(valueRef.current);
          },
        }),
      },
    });
  };

  const discardRow = (rowId: number) => {
    const { [rowId]: _, ...prevState } = editedRow;
    markEditedRow(prevState);
  };

  const discardEditedRows = () => {
    dialogStoreActions.openDialog({
      payload: {
        caption: 'SQL Edits',
        component: (
          <DialogContent note='Discard Changes'>
            {'Are you sure you want to discard all changes?'}
          </DialogContent>
        ),
        variant: 'warn',
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            dialogStoreActions.closeDialog();
            markEditedRow({});
          },
        }),
      },
    });
  };

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
    const sRows = tableStore.get().selectedRows;
    if (sRows.size === 0) {
      return;
    }

    const rowEntries: SqlRow[] = [];

    for (const id of sRows) {
      const row = rowMap.get(id);
      if (row) rowEntries.push(row);
    }

    dialogStoreActions.openDialog({
      payload: {
        caption: 'Delete Data Rows',
        variant: 'error',
        component: (
          <DataRowsDeletePreview
            rows={rowEntries}
            columnsOrder={columnsOrder}
          />
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            dialogStoreActions.closeDialog();
            mutateDelete({
              database: dbSelected,
              table: activeTable,
              rows: rowEntries,
            });
          },
        }),
      },
    });
  };

  const handleSelectedExports = () => {
    const selRows = tableStore.get().selectedRows;
  };

  const handleCreateRows = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createDataRows({
        database: dbSelected,
        table: activeTable,
      }),
    });
  };

  const shellHandlers = {
    onExport: handleSelectedExports,
    onDiscardEdits:
      Object.entries(editedRow).length > 0 ? discardEditedRows : undefined,
    onDelete: handleDeleteRows,
    onSave: Object.entries(editedRow).length > 0 ? handleSaveRows : undefined,
    onFilterColumns: () => {
      makeColumnsActive(columnsOrder);
    },
    onCreate: handleCreateRows,
  };

  // useEffect(() => {
  //   console.log('TableView MOUNT');

  //   return () => {
  //     console.log('TableView UNMOUNT');
  //   };
  // }, []);
  const activeCols = columnsOrder.filter((c) => !hiddenColumns[c]);
  const isBusy = isPending || isDeletePending;

  if (isBusy) return <ScreenLoader />;
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
        <SqlTableContainer
          cols={cols}
          rows={rows}
          columnsOrder={columnsOrder}
          activeCols={activeCols}
          store={tableStore}
          outerRef={outerRef}
          tableRef={tableRef}
          resizeLineRef={resizeLineRef}
          onEditCell={handleEditClick}
          editedRow={editedRow}
        />
      </EffectiveTableWrapper>
    </>
  );
};
