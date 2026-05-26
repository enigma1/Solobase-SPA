import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { routes } from '>/config';
import {
  useMessageStore,
  useDialogStore,
  useAccountStore,
} from '>/services/stores';
import { useErrorDialog } from '>/services/hooks';
import { DialogRenderer } from '>/modules/.';
import { dbApi } from '>/services/api';
import { accountDialogMap } from './DialogMap';

export function Logout() {
  const navigate = useNavigate();

  const { username, initialize, isAuthenticated } = useAccountStore(
    ({ state, api }) => ({
      isAuthenticated: state.isAuthenticated,
      username: state.username,
      initialize: api.initialize,
    }),
  );

  const { dialog, openDialog, closeDialog } = useDialogStore(
    ({ state, api }) => ({
      openDialog: api.openDialog,
      closeDialog: api.closeDialog,
      dialog: state.dialog,
    }),
  );
  const addMessage = useMessageStore(({ api }) => api.addMessage);
  const { withErrorDialog } = useErrorDialog();

  const handleLogout = async () => {
    closeDialog(); // close confirm modal
    const rsp = await withErrorDialog(
      () => dbApi.logout(),
      'Logout failed',
      'errorLogout',
    );

    if (rsp) {
      addMessage({
        type: 'success',
        content: { text: `Goodbye ${username}`, duration: 3000 },
      });
      initialize();
      navigate(routes.front.login, { replace: true });
    } else {
      addMessage({
        content: { text: `An error occurred during logout`, duration: 3000 },
      });
      navigate(routes.front.login, { replace: true });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const onCancelLogout = () => {
        closeDialog();
        navigate('.', { replace: true }); // or any route you want
      };
      openDialog({
        type: 'confirmLogout',
        payload: {
          onConfirm: handleLogout,
          onCancelLogout,
        },
      });
    }
  }, [isAuthenticated]);

  return (
    <DialogRenderer
      dialog={dialog}
      onClose={closeDialog}
      map={accountDialogMap}
    />
  );
}
