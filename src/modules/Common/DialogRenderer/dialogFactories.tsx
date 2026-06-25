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
} from '>/modules';
import { DialogPayload, WizardHandlers, CommonDialogHandlers } from '>/types';

export const dialogFactories: Record<string, (args?: any) => DialogPayload> = {
  makeQuery: () => {
    const handlers: CommonDialogHandlers = {
      confirm: () => {},
    };
    const payload: DialogPayload = {
      initialSize: 'md',
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
        onFinish: () => {
          handlers.finish?.();
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
        onFinish: () => {
          dialogStoreActions.closeDialog();
          handlers.finish?.();
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
        onFinish: () => {
          dialogStoreActions.closeDialog();
          handlers.finish?.();
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

    const labels = [undefined, 'Apply'];
    const payload: DialogPayload = {
      initialSize: 'md',
      caption: 'Preferences',
      component: <Preferences formHandlers={handlers} />,
      variant: 'info',
      actions: dialogActions
        .enabledConfirmCancel({
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

  newUser: () => {
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
        onFinish: () => {
          handlers.finish?.();
          dialogStoreActions.closeDialog();
        },
      }),
    };
    return payload;
  },

  yourPrivileges: () => {
    const payload: DialogPayload = {
      initialSize: 'sm',
      caption: 'Your Priveleges',
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
};
