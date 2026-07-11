import { dialogStoreActions, queriesStoreActions } from '>/services/stores';
import { dialogActions } from '>/services/utils';
import {
  DatabaseNew,
  TableNew,
  TableEdit,
  FilterColumns,
  CreateDataRows,
  QueryRequestArea,
  QueriesExecuted,
  Preferences,
  UserNew,
  SelfCaps,
  ImportDataArea,
  DialogContent,
} from '>/modules';
import { dbApi } from '>/services/api';

import { DialogPayload, WizardHandlers, CommonDialogHandlers } from '>/types';

export const dialogFactories: Record<string, (args?: any) => DialogPayload> = {
  importData: () => {
    const handlers: CommonDialogHandlers = {
      confirm: async (): Promise<void> => {},
      close: () => {},
    };
    const labels = [undefined, 'Import'];
    const payload: DialogPayload = {
      initialSize: 'xl',
      caption: 'SQL Queries',
      component: <ImportDataArea formHandlers={handlers} />,
      variant: 'info',
      onCancel: handlers.close,
      actions: dialogActions
        .enabledConfirmCancel({
          onConfirm: async () => {
            await handlers.confirm();
            dialogStoreActions.closeDialog();
          },
          onCancel: () => {
            handlers?.close?.();
            dialogStoreActions.closeDialog();
          },
        })
        .map((control, idx) => ({
          ...control,
          label: labels[idx] ?? control.label,
        })),
    };
    return payload;
  },

  makeQuery: () => {
    const handlers: CommonDialogHandlers = {
      confirm: () => {},
    };
    const payload: DialogPayload = {
      initialSize: 'lg',
      caption: 'SQL Queries',
      component: <QueryRequestArea formHandlers={handlers} />,
      variant: 'info',
      actions: dialogActions.enabledConfirmCancel({
        onConfirm: () => {
          handlers.confirm();
          dialogStoreActions.closeDialog();
        },
      }),
    };
    return payload;
  },
  editQuery: (title: string) => {
    const handlers: CommonDialogHandlers = {
      confirm: () => {},
    };
    const labels = [undefined, 'Execute'];
    const payload: DialogPayload = {
      initialSize: 'md',
      caption: 'SQL Queries',
      component: (
        <QueryRequestArea queryTitle={title} formHandlers={handlers} />
      ),
      variant: 'info',
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
    };
    return payload;
  },

  createDatabase: () => {
    const handlers: CommonDialogHandlers = {
      confirm: () => {},
    };
    const labels = [undefined, 'Create'];
    const payload: DialogPayload = {
      initialSize: 'lg',
      variant: 'success',
      caption: 'Database Forms',
      component: <DatabaseNew formHandlers={handlers} />,
      actions: dialogActions
        .enabledConfirmCancel({
          onConfirm: async () => {
            await handlers.confirm();
            dialogStoreActions.closeDialog();
          },
        })
        .map((control, idx) => ({
          ...control,
          label: labels[idx] ?? control.label,
        })),
    };
    return payload;
  },

  createTable: (dbSelected: string) => {
    const handlers: WizardHandlers = {};
    const payload: DialogPayload = {
      initialSize: 'lg',
      caption: 'Database Forms',
      component: <TableNew wizardHandlers={handlers} database={dbSelected} />,
      variant: 'success',
      actions: dialogActions.wizard({
        onNext: () => {
          handlers.next?.();
        },
        onPrevious: () => {
          handlers.previous?.();
        },
        onFinish: async () => {
          await handlers.finish?.();
          dialogStoreActions.closeDialog();
        },
      }),
    };
    return payload;
  },
  editTable: ({ database, table }: { database: string; table: string }) => {
    const handlers: WizardHandlers = {};
    const payload: DialogPayload = {
      initialSize: 'lg',
      caption: 'Database Forms',
      component: (
        <TableEdit
          wizardHandlers={handlers}
          table={table}
          database={database}
        />
      ),
      variant: 'success',
      actions: dialogActions.wizard({
        onNext: () => {
          handlers.next?.();
        },
        onPrevious: () => {
          handlers.previous?.();
        },
        onFinish: async () => {
          await handlers.finish?.();
          dialogStoreActions.closeDialog();
        },
      }),
    };
    return payload;
  },

  createDataRows: ({
    database,
    table,
  }: {
    database: string;
    table: string;
  }) => {
    const handlers: WizardHandlers = {};
    const payload: DialogPayload = {
      initialSize: 'lg',
      caption: 'Database Forms',
      component: (
        <CreateDataRows
          wizardHandlers={handlers}
          database={database}
          table={table}
        />
      ),
      variant: 'success',
      actions: dialogActions.wizard({
        onNext: () => {
          handlers.next?.();
        },
        onPrevious: () => {
          handlers.previous?.();
        },
        onFinish: async () => {
          await handlers.finish?.();
          dialogStoreActions.closeDialog();
        },
      }),
    };
    return payload;
  },

  filterColumns: ({
    filterProps,
  }: {
    filterProps: {
      hiddenColumns: Record<string, boolean>;
      columnsOrder: string[];
      onChange: (col: string, hidden: boolean) => void;
    };
  }) => {
    const payload: DialogPayload = {
      initialSize: 'xs',
      caption: 'Preferences',
      component: <FilterColumns {...filterProps} />,
      variant: 'info',
      actions: dialogActions.ack(),
    };
    return payload;
  },

  editPreferences: () => {
    const handlers: CommonDialogHandlers = {
      confirm: () => {},
    };

    const labels = [undefined, 'Save Preferences'];
    const payload: DialogPayload = {
      initialSize: 'md',
      caption: 'Settings',
      component: <Preferences formHandlers={handlers} />,
      variant: 'info',
      actions: dialogActions
        .confirmCancel({
          onConfirm: () => {
            handlers.confirm();
            // dialogStoreActions.closeDialog();
          },
        })
        .map((control, idx) => ({
          ...control,
          label: labels[idx] ?? control.label,
        })),
    };
    return payload;
  },

  createUser: () => {
    const handlers: WizardHandlers = {};
    const payload: DialogPayload = {
      initialSize: 'lg',
      caption: 'Database Forms',
      component: <UserNew wizardHandlers={handlers} />,
      variant: 'success',
      actions: dialogActions.wizard({
        onNext: () => {
          handlers.next?.();
        },
        onPrevious: () => {
          handlers.previous?.();
        },
        onFinish: async () => {
          await handlers.finish?.();
          dialogStoreActions.closeDialog();
        },
      }),
    };
    return payload;
  },

  yourPrivileges: () => {
    const payload: DialogPayload = {
      initialSize: 'sm',
      caption: 'Account Priveleges',
      component: <SelfCaps />,
      variant: 'info',
      actions: dialogActions.ack(),
    };
    return payload;
  },

  queriesExecuted: () => {
    const labels = [undefined, 'Reset'];
    const payload: DialogPayload = {
      initialSize: 'xxl',
      caption: 'Queries Executed',
      component: <QueriesExecuted />,
      variant: 'info',
      actions: dialogActions
        .confirmCancel({
          onConfirm: () => {
            dialogStoreActions.closeDialog();
            queriesStoreActions.resetExecutedQueries();
          },
        })
        .map((control, idx) => ({
          ...control,
          label: labels[idx] ?? control.label,
        })),
    };
    return payload;
  },

  clearPendingRequests: () => {
    const payload: DialogPayload = {
      initialSize: 'md',
      caption: 'Server',
      component: (
        <DialogContent note='Clear Pending Requests'>
          {'Are you sure you want to clear pending requests?'}
        </DialogContent>
      ),
      variant: 'warn',
      actions: dialogActions.confirmCancel({
        onConfirm: async () => {
          await dbApi.abort();
          dialogStoreActions.closeDialog();
        },
      }),
    };
    return payload;
  },
};
