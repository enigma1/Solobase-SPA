import { dialogStoreActions } from '>/services/stores';
import { dialogActions } from '>/services/utils';
import {
  DatabaseNew,
  TableNew,
  TableEdit,
  FilterColumns,
  CreateDataRows,
  QueryRequestArea,
} from '>/modules';
import { DialogPayload, WizardHandlers, CommonDialogHandlers } from '>/types';

export const dialogFactories: Record<string, (args?: any) => DialogPayload> = {
  makeQuery: () => {
    const handlers: CommonDialogHandlers = {
      confirm: () => {},
    };
    const payload: DialogPayload = {
      initialSize: 'md',
      caption: 'Database Forms',
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

  createDatabase: () => ({
    caption: 'Database Forms',
    component: <DatabaseNew />,
    variant: 'success',
  }),
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
      initialSize: 'sm',
      caption: 'Preferences',
      component: <FilterColumns {...filterProps} />,
      variant: 'info',
      actions: dialogActions.ack(),
    };
    return payload;
  },
};
