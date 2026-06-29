import { useEffect, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  queryKeys,
  useDeleteUsersMutation,
  useUsers,
} from '>/services/queryHooks';
import {
  useConfigStore,
  messageStoreActions,
  createFactoryTableStore,
  dialogStoreActions,
} from '>/services/stores';
import {
  getColumnsFromRow,
  getColumnsFromResult,
  getSingleColumnFromResult,
  createFileSaveUrl,
  dialogActions,
  makeColumnsActive,
} from '>/services/utils';
import {
  ViewRow,
  SqlColumnsShape,
  SqlRow,
  ScalarObject,
  CommonDialogHandlers,
  WizardHandlers,
} from '>/types';
import {
  ScreenLoader,
  EffectiveTableWrapper,
  SqlTableContainer,
  PageTableShell,
  DialogContent,
  dialogFactories,
} from '>/modules';

import { UsersDeletePreview } from './UsersPreviews';
import { UserEdit } from './UserEdit';

// type UsersListProps = {
//   rows: ViewRow<SqlRow>[];
//   cols: SqlColumnsShape;
//   columnsOrder: string[];
// };
// export const UsersList = ({ cols, rows, columnsOrder }: UsersListProps) => {

export const UsersList = () => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const tableStore = useMemo(() => createFactoryTableStore(), []);

  const queryClient = useQueryClient();
  // Fetch Users
  const {
    rows: tRows,
    cols,
    columnsOrder,
  } = useUsers(({ state }) => ({
    rows: state.rows,
    cols: state.cols,
    columnsOrder: state.columnsOrder,
  }));

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

  const { hiddenColumns } = useConfigStore(({ state }) => ({
    hiddenColumns: state.hiddenColumns,
  }));

  const deleteUsersCallbacks = {
    onSuccess: (data: any) => {
      if (data.ok) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users(),
          exact: true,
        });

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

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.databaseServerInfo(),
      exact: true,
    });
  }, []);

  const handleCreateUser = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createDatabase(),
    });
  };

  const handleDeleteUsers = () => {
    const sRows = tableStore.get().selectedRows;
    if (sRows.size === 0) {
      return;
    }

    const dbEntries: SqlRow[] = [];

    for (const id of sRows) {
      const row = rowMap.get(id);
      if (row) dbEntries.push(row);
    }
    const hostsUsers = getColumnsFromResult({
      rows: dbEntries,
      columnsOrder,
      fields: ['Host', 'User'],
    });

    dialogStoreActions.openDialog({
      payload: {
        caption: 'Removal of Databases',
        variant: 'error',
        component: (
          <UsersDeletePreview rows={dbEntries} columnsOrder={columnsOrder} />
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

  const activeCols = columnsOrder.filter((c) => !hiddenColumns[c]);

  const isBusy = isPending;
  if (isBusy) return <ScreenLoader />;

  return (
    <>
      <PageTableShell
        store={tableStore}
        title={`Users: ${rows.length}`}
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
          onEditRow={onEditRow}
        />
      </EffectiveTableWrapper>
    </>
  );
};
