import { useEffect } from 'react';
import { useDialogStore } from '>/services/stores';
import { dialogActions } from '>/services/utils';
import { DialogContent } from '>/modules';

export const GlobalDialogError = () => {
  const { isActive, response, openDialogAsync } = useDialogStore(
    ({ state, api }) => ({
      openDialogAsync: api.openDialogAsync,
      isActive: state.dialog,
      response: state.response,
    }),
  );

  useEffect(() => {
    if (isActive || !response) {
      return;
    }
    const currentResponse = response;
    const handleDialog = async () => {
      await openDialogAsync({
        payload: {
          caption: 'Local Error',
          component: (
            <DialogContent note='Unexpected Local Error'>
              <h3>{currentResponse.error}</h3>
              <p className='text-sm'>{currentResponse.message}</p>

              {currentResponse.details && (
                <ul>
                  {currentResponse.details.map((d, idx) => (
                    <li key={`local-error-${idx}`}>{d}</li>
                  ))}
                </ul>
              )}
            </DialogContent>
          ),
          actions: dialogActions.ack(),
        },
      });
    };
    handleDialog();
  }, [isActive, response]);

  return null;
};
