import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { dialogStoreActions } from '>/services/stores';
import { dialogActions } from '>/services/utils';
import { DialogContent } from '>/modules';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      dialogStoreActions.openDialog({
        payload: {
          caption: 'General Error',
          component: (
            <DialogContent note='Data Fetching Error'>
              {(error as Error).message}
            </DialogContent>
          ),
          actions: dialogActions.ack(),
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      dialogStoreActions.openDialog({
        payload: {
          caption: 'Action Failed',
          component: (
            <DialogContent note='Action Request Error'>
              {(error as Error).message}
            </DialogContent>
          ),
          actions: dialogActions.ack(),
        },
      });
    },
  }),
});
