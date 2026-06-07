import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useCreateTableMutation } from '>/services/queryHooks';
import { messageStoreActions, useAccountStore } from '>/services/stores';
import { dbApi, CreateTableRequest } from '>/services/api';
import { ScreenLoader } from '>/modules';
import { TableShape, WizardHandlers } from '>/types';
import { TableForm } from './TableForm';

type TableNewProps = {
  database: string;
  wizardHandlers: WizardHandlers;
};

export const TableNew = ({ database, wizardHandlers }: TableNewProps) => {
  const queryClient = useQueryClient();
  const createTableCallbacks = {
    onSuccess: (data: any) => {
      if (data.ok) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables(database),
          exact: true,
        });
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: `Table created in ${database}`, duration: 5000 },
        });
      } else {
        messageStoreActions.addMessage({
          content: {
            type: 'warn',
            text: data.message ?? 'Could not create table',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to create table', duration: 5000 },
      });
    },
  };

  const { mutate, isPending, response } = useCreateTableMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    createTableCallbacks,
  );

  const onNewSubmit = async (values: TableShape) => {
    mutate({
      database,
      table: values.table,
      engine: values.engine,
      charset: values.charset,
      collation: values.collation,
    });
  };

  const isBusy = isPending;

  if (isBusy) return <ScreenLoader />;
  return (
    <TableForm
      wizardHandlers={wizardHandlers}
      initialValues={{ collation: '', charset: '', engine: '' }}
      onSubmit={onNewSubmit}
    />
  );
};
