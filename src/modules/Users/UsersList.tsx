import { useEffect, useRef, useMemo } from 'react';
import { useDeleteUsersMutation } from '>/services/queryHooks';
import {
  useColumnsStore,
  useConfigStore,
  useDialogStore,
  messageStoreActions,
  FactoryTableStore,
} from '>/services/stores';
import {
  getColumnsFromRow,
  getColumnsFromResult,
  getOnlyColumnsFromResult,
  dialogActions,
  makeColumnsActive,
  buildColumnActions,
  filterUserActionOptions,
} from '>/services/utils';
import {
  ScreenLoader,
  EffectiveTableWrapper,
  SqlTableContainer,
  PageTableShell,
  dialogFactories,
  DialogContent,
  EditDataCellRaw,
} from '>/modules';
import {
  ViewRow,
  SqlColumnsShape,
  SqlRow,
  WizardHandlers,
  PagingContext,
  ColumnActions,
  ActionColumnProps,
} from '>/types';
import { UsersDeletePreview } from './UsersPreviews';
import { UserEdit } from './UserEdit';

type UsersListProps = {
  username: string;
  rows: ViewRow<SqlRow>[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
  store: FactoryTableStore;
  uidSelected?: string;
};

export const UsersList = ({
  username,
  rows,
  cols,
  columnsOrder,
  store,
  uidSelected,
}: UsersListProps) => {
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

  const { openDialog, closeDialog } = useDialogStore(({ api }) => ({
    openDialog: api.openDialog,
    closeDialog: api.closeDialog,
  }));

  const deleteUsersCallbacks = {
    onSuccess: (data: any) => {
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

  const { mutate, isPending, response } = useDeleteUsersMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    deleteUsersCallbacks,
  );

  // ----------------
  // No-Hooks Section
  // ----------------

  const handleCreateUser = () => {
    openDialog({
      payload: dialogFactories.createUser(),
    });
  };

  const handleDeleteUsers = () => {
    const sRows = store.get().selectedRows;
    if (sRows.size === 0) {
      return;
    }

    const dbEntries: SqlRow[] = [];

    for (const id of sRows) {
      const row = rowMap.get(id);
      if (row) dbEntries.push(row);
    }

    const fields = ['Host', 'User'];

    const hostsUsers = getColumnsFromResult({
      rows: dbEntries,
      columnsOrder,
      fields,
    });
    const hostsUsersPreview = getOnlyColumnsFromResult({
      rows: dbEntries,
      columnsOrder,
      fields,
    });

    openDialog({
      payload: {
        caption: 'Removal of Databases',
        variant: 'error',
        component: (
          <UsersDeletePreview
            rows={hostsUsersPreview}
            columnsOrder={['Host', 'User']}
          />
        ),
        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            closeDialog();
            mutate({ columnsOrder, rows: hostsUsers });
          },
        }),
      },
    });
  };

  const onEditRow = (uid: string) => {
    const row = rowMap.get(uid);
    if (!row) return;
    const fields = getColumnsFromRow({
      row,
      columnsOrder,
      fields: ['Host', 'User'],
    });
    const handlers: WizardHandlers = {};
    const labels = [undefined, undefined, 'Update'];
    openDialog({
      payload: {
        initialSize: 'lg',
        caption: 'Database Forms',
        variant: 'warn',
        component: (
          <UserEdit
            wizardHandlers={handlers}
            user={fields.User as string}
            host={fields.Host as string}
          />
        ),
        actions: dialogActions
          .wizard({
            onNext: () => {
              handlers.next?.();
            },
            onPrevious: () => {
              handlers.previous?.();
            },
            onFinish: () => {
              handlers.finish?.();
              closeDialog();
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
    onCreate: handleCreateUser,
    onDelete: handleDeleteUsers,
    onFilterColumns: () => {
      makeColumnsActive(columnsOrder);
    },
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
            userRows: limit,
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
        title={`Users List: ${start}-${end} / Logged as: [${username}]`}
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
          actionOptions={filterUserActionOptions}
          columnActions={columnsActions}
          onActionCol={handleColumnAction}
          selectedRow={uidSelected}
          onEditRow={onEditRow}
        />
      </EffectiveTableWrapper>
    </>
  );
};
