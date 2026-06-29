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
  return <div>Account not in use</div>;
};
