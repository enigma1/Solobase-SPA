import { useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useConfigStore,
  useTablesDataStore,
  useMessageStore,
  dialogStoreActions,
  FactoryTableStore,
  historyStoreActions,
} from '>/services/stores';
import {
  MutationCallbacks,
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
  EditDataCellRaw,
  dialogFactories,
} from '>/modules';
import { routes } from '>/config';
import {
  UpdateDataRowsRequest,
  UpdateDataRowsResponse,
  DeleteDataRowsRequest,
  DeleteDataRowsResponse,
} from '>/services/api/dbApiTypes';
import {
  SqlColumnsShape,
  SqlRow,
  SqlObject,
  SqlTypes,
  ViewRow,
  TokenRow,
  PagingContext,
} from '>/types';
import { updateRowsSqlTransformer, deleteRowsSqlTransformer } from './helpers';
import { DataRowsDeletePreview } from './DataRowsPreview';

type TableViewProps = {
  rows: ViewRow<SqlRow>[];
  rowTokens?: TokenRow[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
  dbSelected: string;
  activeTable: string;
  store: FactoryTableStore;
};

export const DataRowsList = ({
  cols,
  rows,
  rowTokens,
  columnsOrder,
  dbSelected,
  activeTable,
  store,
}: TableViewProps) => {
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

  const addMessage = useMessageStore(({ api }) => api.addMessage);
  const { editedRow, markEditedRow } = useTablesDataStore(({ state, api }) => ({
    editedRow: state.editedRow as Record<number, SqlObject>,
    markEditedRow: api.markEditedRow,
  }));

  const callbacks = {
    onSuccess: () => {
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
      // reset local edited state if provided
      markEditedRow({});
      addMessage({
        type: 'warn',
        content: { text: `Rows removed`, duration: 3000 },
      });
    },

    onError: (error) => {
      addMessage({
        content: { text: `Failed to remove rows`, duration: 5000 },
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
    row: SqlRow;
    rId: number;
    cId: number;
    colName: string;
  }) => {
    const valueRef = { current: row[cId] };
    const saveChanges = (newValue: SqlTypes) => {
      markEditedRow((previousState) => {
        const prevRow = (previousState as Record<number, SqlObject>)[rId] || {};
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
          <DialogContent note={`${cols[colName].type} @${colName}[${rId}]`}>
            <EditDataCellRaw
              type={cols[colName].type}
              value={valueRef.current}
              onChange={(v) => {
                valueRef.current = v;
              }}
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
      rowTokens,
      componentShape: editedRow,
      cols,
      database: dbSelected,
      table: activeTable,
      originalRows: rows.map((r) => r.row) as SqlRow[],
    });
    mutate(rowsTransformed);
  };

  const handleDeleteRows = () => {
    const sRows = store.get().selectedRows;
    if (sRows.size === 0) {
      return;
    }

    const originalRows = [...sRows].map((key) => rowMap.get(key)!);

    const rowsTransformed = deleteRowsSqlTransformer({
      database: dbSelected,
      table: activeTable,
      originalRows,
      rowTokens,
    });

    dialogStoreActions.openDialog({
      payload: {
        caption: 'Delete Data Rows',
        variant: 'error',
        component: (
          <DataRowsDeletePreview
            rows={originalRows}
            columnsOrder={columnsOrder}
          />
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            dialogStoreActions.closeDialog();
            mutateDelete(rowsTransformed);
            store.api.clearSelected();
          },
        }),
      },
    });
  };

  const handleCopyRow = (uid: string) => {
    const row = rowMap.get(uid);
    if (row) {
      historyStoreActions.addCopiedRow({ row, columnsOrder });
    }
  };

  const handleSelectedExports = () => {
    const selRows = store.get().selectedRows;
  };

  const handleCreateRows = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createDataRows({
        database: dbSelected,
        table: activeTable,
      }),
    });
  };

  const handleBack = () => {
    navigate(routes.front.listTables, {
      replace: true,
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
            dataRows: limit,
          },
        });
      },
    };
  };

  const activeCols = columnsOrder.filter((c) => !hiddenColumns[c]);
  const isBusy = isPending || isDeletePending;

  if (isBusy) return <ScreenLoader />;

  const pagingContext = getPagingContext();
  const start = paging.offset + 1;
  const end = paging.offset + rows.length;

  return (
    <>
      <PageTableShell
        store={store}
        tableRef={tableRef}
        title={`${activeTable}: ${start}–${end}`}
        actions={shellHandlers}
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
          onEditCell={handleEditClick}
          onCopyRow={handleCopyRow}
          editedRow={editedRow}
        />
      </EffectiveTableWrapper>
    </>
  );
};
