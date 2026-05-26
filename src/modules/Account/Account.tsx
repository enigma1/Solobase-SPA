import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { routes } from '>/config';
import { Login } from './Login';

import { useErrorDialog } from '>/services/hooks';
import {
  useMessageStore,
  useDialogStore,
  useAccountStore,
} from '>/services/stores';
import { dbApi } from '>/services/api';
import { DialogRenderer } from '>/modules/Common';
import { accountDialogMap } from './DialogMap';

export const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, initialize, isAuthenticated } = useAccountStore(
    ({ state, api }) => ({
      username: state.username,
      isAuthenticated: state.isAuthenticated,
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

  // const addMessage = useMessageStore(({ api }) => api.addMessage);
  // const { withErrorDialog } = useErrorDialog();
  // const handleLogout = async () => {
  //   closeDialog(); // close confirm modal
  //   const rsp = await withErrorDialog(
  //     () => dbApi.logout(),
  //     'Logout failed',
  //     'errorLogout',
  //   );

  //   if (rsp) {
  //     addMessage({
  //       type: 'success',
  //       content: { text: `Goodbye ${username}`, duration: 3000 },
  //     });
  //     initialize();
  //     navigate(routes.front.login, { replace: true });
  //   } else {
  //     addMessage({
  //       content: { text: `An error occurred during logout`, duration: 3000 },
  //     });
  //     navigate(routes.front.login, { replace: true });
  //   }
  // };

  // const params = new URLSearchParams(location.search);
  // const isLogout = params.get('action') === 'logout';

  // useEffect(() => {
  //   if (isLogout) {
  //     const onCancelLogout = () => {
  //       closeDialog();
  //       navigate('.', { replace: true }); // or any route you want
  //     };
  //     openDialog({
  //       type: 'confirmLogout',
  //       payload: {
  //         onConfirm: handleLogout,
  //         onCancelLogout,
  //       },
  //     });
  //   }
  // }, [isLogout]);

  // return (
  //   <>
  //     {isAuthenticated ? <Dashboard /> : <Login />}
  //     <DialogRenderer
  //       dialog={dialog}
  //       onClose={closeDialog}
  //       map={accountDialogMap}
  //     />
  //   </>
  // );

  return <div>Account not in use</div>;
};
