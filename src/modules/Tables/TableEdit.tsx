import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useEditTableMutation } from '>/services/queryHooks';
import { messageStoreActions } from '>/services/stores';
import { useTableDetailsHook } from '>/services/queryHooks';
import { ScreenLoader } from '>/modules';
import { TableShape, WizardHandlers } from '>/types';
import { TableForm } from './TableForm';
import { TableFormShape } from './Form';

type TableEditProps = {
  database: string;
  table: string;
  wizardHandlers: WizardHandlers;
};

export const TableEdit = ({
  database,
  table,
  wizardHandlers,
}: TableEditProps) => {
  const queryClient = useQueryClient();

  const request = { database, table };
  const {
    engine,
    collation,
    charset,
    cols,
    keys,
    isFetching,
    isSuccess,
    isError,
  } = useTableDetailsHook(request, ({ state, query }) => ({
    collation: state.collation,
    engine: state.engine,
    charset: state.charset,
    cols: state.cols,
    keys: state.keys,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
  }));

  const originalTable = {
    database,
    table,
    engine,
    charset,
    collation,
    cols,
    keys,
  };

  const formDefaults = {
    database,
    table,
    engine,
    charset,
    collation,
    cols,
    keys,
  };

  const editTableCallbacks = {
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tableDetails(request.database, request.table),
        exact: true,
      });

      if (data.ok) {
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

  const onSubmit = async (values: TableFormShape) => {
    mutate({
      original: originalTable,
      modified: {
        ...values,
        database,
      },
    });
  };

  const isBusy = isPending || isFetching;
  if (isBusy) return <ScreenLoader />;

  return (
    <TableForm
      mode='edit'
      database={database}
      wizardHandlers={wizardHandlers}
      initialValues={formDefaults}
      onSubmit={onSubmit}
    />
  );
};
