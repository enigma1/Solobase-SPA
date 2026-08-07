import { useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useConfigStore,
  useMessageStore,
  dialogStoreActions,
  FactoryTableStore,
  historyStoreActions,
  useColumnsStore,
} from '>/services/stores';
import {
  MutationCallbacks,
  useUpdateRowsMutation,
  useDeleteRowsMutation,
} from '>/services/queryHooks';
import {
  dialogActions,
  makeColumnsActive,
  filterDataActionOptions,
  buildColumnActions,
} from '>/services/utils';
import {
  SqlTableContainer,
  EffectiveTableWrapper,
  ScreenLoader,
  PageTableShell,
  DialogContent,
  EditDataCellRaw,
  dialogFactories,
  FiltersAndSortsNotice,
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
  ColumnActions,
  ActionColumnProps,
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

  const addMessage = useMessageStore(({ api }) => api.addMessage);

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

  // ----------------
  // No-Hooks Section
  // ----------------

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
    if (
      actions.filter.mode === 'distinct' ||
      actions.filter.mode === 'groupBy' ||
      actions.filter.value === undefined
    ) {
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

  const isBusy = isPending || isDeletePending;
  if (isBusy) return <ScreenLoader />;

  const hasSorts = Object.keys(sortBy).length > 0;
  const hasFilters = Object.keys(filters).length > 0;

  let notice;
  if (hasFilters || hasSorts) {
    notice = (
      <FiltersAndSortsNotice
        cols={cols}
        clearSorts={hasSorts}
        clearFilters={hasFilters}
      />
    );
  }
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
        title={`${activeTable}: ${start}–${end}`}
        actions={shellHandlers}
        paging={pagingContext}
        indicators={{ hasHiddenColumns }}
        notice={notice}
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
          columnActions={columnsActions}
          onActionCol={handleColumnAction}
          onEditCell={handleEditClick}
          onCopyRow={handleCopyRow}
          editedRow={editedRow}
          actionOptions={filterDataActionOptions}
        />
      </EffectiveTableWrapper>
    </>
  );
};
