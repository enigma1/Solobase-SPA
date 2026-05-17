import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { dialogStoreActions } from '>/services/stores';

const { openDialog, closeDialog } = dialogStoreActions;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      openDialog({
        type: 'commonError',
        payload: {
          error: {
            title: 'GeneralError',
            msg: (error as Error).message,
          },
          onClear: closeDialog,
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      openDialog({
        type: 'commonError',
        payload: {
          error: {
            title: 'Action failed',
            msg: (error as Error).message,
          },
          onClear: closeDialog,
        },
      });
    },
  }),
});
