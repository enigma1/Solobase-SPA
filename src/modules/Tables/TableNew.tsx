import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateTableMutation } from '>/services/queryHooks';
import { messageStoreActions } from '>/services/stores';
import { CreateTableResponse } from '>/services/api';
import { ScreenLoader } from '>/modules';
import { routes } from '>/config';
import { WizardHandlers } from '>/types';
import { TableForm } from './TableForm';
import { TableFormShape } from './Form';

type TableNewProps = {
  database: string;
  wizardHandlers: WizardHandlers;
};

export const TableNew = ({ database, wizardHandlers }: TableNewProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const createTableCallbacks = {
    onSuccess: (data: CreateTableResponse) => {
      if (data.ok) {
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
      if (location.pathname !== routes.front.listTables) {
        navigate(routes.front.listTables);
        return;
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to create table', duration: 5000 },
      });
    },
  };

  const { mutate, mutateAsync, isPending, response } = useCreateTableMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      mutateAsync: api.mutateAsync,
      response: state,
    }),
    createTableCallbacks,
  );

  const onNewSubmit = async (values: TableFormShape) => {
    await mutateAsync({ ...values, database });
  };

  const isBusy = isPending;
  if (isBusy) return <ScreenLoader />;
  return (
    <TableForm
      database={database}
      wizardHandlers={wizardHandlers}
      onSubmit={onNewSubmit}
    />
  );
};
