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

  return <div>Account not in use</div>;
};
