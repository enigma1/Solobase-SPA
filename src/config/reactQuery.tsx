import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { dialogStoreActions } from '>/services/stores';
import { dialogActions } from '>/services/utils';
import { DialogContent } from '>/modules';
import { ApiError } from '>/types';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const e = error as ApiError;
      console.error('QueryCache', error);
      dialogStoreActions.openDialog({
        payload: {
          caption: 'General Error',
          component: (
            <DialogContent note='Data Fetching Error'>
              {e.message}
            </DialogContent>
          ),
          actions: dialogActions.ack(),
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const e = error as ApiError;
      console.error('MutationCache', error);
      const isActive = dialogStoreActions.getActive();
      if (isActive) {
        dialogStoreActions.setError(e);
        return;
      }

      dialogStoreActions.openDialog({
        payload: {
          caption: 'Action Failed',
          component: (
            <DialogContent note='Action Request Error'>
              <h3>{e.error}</h3>
              <p className='text-sm'>{e.message}</p>
              {e.details && (
                <ul>
                  {e.details.map((d, idx) => (
                    <li key={`mutation-error-${idx}`}>{d}</li>
                  ))}
                </ul>
              )}
            </DialogContent>
          ),
          actions: dialogActions.ack(),
        },
      });
    },
  }),
});
