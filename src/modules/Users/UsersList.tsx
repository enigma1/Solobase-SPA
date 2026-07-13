import { useEffect, useRef, useMemo } from 'react';
import { useDeleteUsersMutation, useUsers } from '>/services/queryHooks';
import {
  useConfigStore,
  messageStoreActions,
  createFactoryTableStore,
  dialogStoreActions,
} from '>/services/stores';
import {
  getColumnsFromRow,
  getColumnsFromResult,
  getOnlyColumnsFromResult,
  dialogActions,
  makeColumnsActive,
} from '>/services/utils';
import {
  ScreenLoader,
  EffectiveTableWrapper,
  SqlTableContainer,
  PageTableShell,
  dialogFactories,
} from '>/modules';
import {
  ViewRow,
  SqlColumnsShape,
  SqlRow,
  WizardHandlers,
  PagingContext,
} from '>/types';
import { UsersDeletePreview } from './UsersPreviews';
import { UserEdit } from './UserEdit';

export const UsersList = () => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const store = useMemo(
    () => createFactoryTableStore({ listingType: 'userRows' }),
    [],
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

  const {
    rows: tRows,
    cols,
    columnsOrder,
    responsePaging,
    isSuccess,
    isFetching,
  } = useUsers(
    {
      paging: {
        limit: paging.limit,
        offset: paging.offset,
      },
    },
    ({ state, query }) => ({
      isSuccess: query.isSuccess,
      isFetching: query.isFetching,
      rows: state.rows,
      cols: state.cols,
      columnsOrder: state.columnsOrder,
      responsePaging: state.paging,
    }),
  );

  const rows: ViewRow<SqlRow>[] = useMemo(() => {
    return tRows.map((row, idx) => ({
      row,
      uiKey: idx.toString(),
    }));
  }, [tRows]);

  const rowMap = useMemo(
    () => new Map(rows.map((r) => [r.uiKey, r.row])),
    [rows],
  );

  useEffect(() => {
    if (!isSuccess) return;

    store.api.setPaging({
      hasNext: responsePaging?.hasNext ?? false,
      hasPrevious: responsePaging?.hasPrevious ?? false,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious]);

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

  const handleCreateUser = () => {
    dialogStoreActions.openDialog({
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

    dialogStoreActions.openDialog({
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
            dialogStoreActions.closeDialog();
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
    dialogStoreActions.openDialog({
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

  const activeCols = columnsOrder.filter((c) => !hiddenColumns[c]);

  const isBusy = isPending || isFetching;
  if (isBusy) return <ScreenLoader />;

  const pagingContext = getPagingContext();
  const start = paging.offset + 1;
  const end = paging.offset + rows.length;

  return (
    <>
      <PageTableShell
        store={store}
        title={`Users: ${start}-${end}`}
        tableRef={tableRef}
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
          onEditRow={onEditRow}
        />
      </EffectiveTableWrapper>
    </>
  );
};
