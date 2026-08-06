import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import {
  messageStoreActions,
  accountStoreActions,
  dialogStoreActions,
} from '>/services/stores';
import { useSessionRestore } from '>/services/queryHooks';
import { ScreenLoader, DialogContent } from '>/modules';
import { isNonEmptyString, dialogActions } from '>/services/utils';
import { demoMode } from '>/config';
import { browserRouter } from './Routes';
import { AppBootstrap } from './AppBootstrap';

export const App = () => {
  const { session, isSuccess, isFetching } = useSessionRestore(
    ({ query, state }) => ({
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
      session: state,
    }),
  );
  // used to block session restore after logout
  useEffect(() => {
    if (demoMode) {
      messageStoreActions.addMessage({
        type: 'error',
        mode: 'top',
        fixed: true,
        id: 'demo',
        content: {
          text: `Solobase SPA Demo Mode — Mocked backend with prerecorded database responses which may not exactly match previous selections. For details: https://github.com/enigma1/Solobase-SPA`,
        },
      });
    }
    const canRestore = sessionStorage.getItem('can-restore');
    if (canRestore !== 'true') {
      sessionStorage.setItem('can-restore', 'true');
    }
    const startupError = dialogStoreActions.getError();

    if (startupError) {
      dialogStoreActions.openDialog({
        anonymous: true,
        payload: {
          caption: 'Action Failed',
          component: (
            <DialogContent note='Initialization Errors'>
              <h3>{startupError.error}</h3>
              <p className='text-sm'>{startupError.message}</p>
              {startupError.details && (
                <ul>
                  {startupError.details.map((d, idx) => (
                    <li key={`initialization-errors-${idx}`}>{d}</li>
                  ))}
                </ul>
              )}
            </DialogContent>
          ),
          actions: dialogActions.ack(),
        },
      });
    }
  }, []);

  useEffect(() => {
    if (isSuccess && session && isNonEmptyString(session.username)) {
      accountStoreActions.setCapabilities(session.capabilities);
      messageStoreActions.addMessage({
        type: 'success',
        content: {
          text: `Session restored - welcome back ${session.username}`,
          duration: 3000,
        },
      });
    }
  }, [isSuccess]);

  const isBusy = !isSuccess && isFetching;
  if (isBusy) return <ScreenLoader />;
  return (
    <>
      <AppBootstrap>
        <RouterProvider router={browserRouter} />;
      </AppBootstrap>
    </>
  );
};
