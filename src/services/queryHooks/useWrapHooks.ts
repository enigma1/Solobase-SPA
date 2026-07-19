import { useNavigate } from 'react-router-dom';
import {
  accountStoreActions,
  messageStoreActions,
  tablesDataStoreActions,
  configStoreActions,
} from '>/services/stores';
import { routes } from '>/config';
import type {
  ImportDataResponse,
  SelectDatabaseResponse,
} from '>/services/api/dbApiTypes';
import {
  useSelectDatabaseMutation,
  useImportDataMutation,
} from './useWriteHooks';
import { MutationRequestMeta } from './defs';

export const useSelectDatabaseWrap = () => {
  const navigate = useNavigate();

  const callbacks = {
    onSuccess: (data: SelectDatabaseResponse) => {
      const pageSizes = configStoreActions.getPageSizes();
      tablesDataStoreActions.initialize();
      navigate(routes.front.listTables, { replace: true });
    },

    onError: (error: any) => {
      console.error('select-database-error', error);

      messageStoreActions.addMessage({
        content: {
          text: 'Failed to select database',
          duration: 3000,
        },
      });
    },
  };

  const mutation = useSelectDatabaseMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      mutateAsync: api.mutateAsync,
      response: state,
    }),
    callbacks,
  );

  return mutation;
};

export const useImportDataWrap = (metaOptions?: MutationRequestMeta) => {
  const callbacks = {
    onSuccess: (data: ImportDataResponse) => {
      accountStoreActions.setActiveDatabase(null);
      if (!data.ok) {
        messageStoreActions.addMessage({
          type: 'warn',
          content: {
            text: 'There were problems processing data',
            duration: 3000,
          },
        });
      } else {
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: 'Data processed successfully', duration: 3000 },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to execute query', duration: 3000 },
      });
    },
  };

  const mutation = useImportDataMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      mutateAsync: api.mutateAsync,
      response: state,
    }),
    callbacks,
    metaOptions,
  );

  return mutation;
};
