import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useEditTableMutation } from '>/services/queryHooks';
import { messageStoreActions, useAccountStore } from '>/services/stores';
import { ScreenLoader } from '>/modules';
import { TableShape, WizardHandlers } from '>/types';
import { TableForm } from './TableForm';

type TableEditProps = TableShape & {
  database: string;
  wizardHandlers: WizardHandlers;
};

export const TableEdit = ({
  database,
  table,
  engine,
  charset,
  collation,
  wizardHandlers,
}: TableEditProps) => {
  const queryClient = useQueryClient();
  const editTableCallbacks = {
    onSuccess: (data: any) => {
      if (data.ok) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables(database),
          exact: true,
        });
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: `Table changed in ${database}`, duration: 5000 },
        });
      } else {
        messageStoreActions.addMessage({
          content: {
            type: 'warn',
            text: data.message ?? 'Could not change table',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to change table parametrers', duration: 5000 },
      });
    },
  };

  const { mutate, isPending, response } = useEditTableMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    editTableCallbacks,
  );

  const onDbSubmit = async (values: TableShape) => {
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
      initialValues={{ table, engine, collation, charset }}
      onSubmit={onDbSubmit}
    />
  );
};
