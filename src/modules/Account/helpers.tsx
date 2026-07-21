import type { MouseEvent } from 'react';
import {
  messageStoreActions,
  dialogStoreActions,
  accountStoreActions,
} from '>/services/stores';
import { dialogActions } from '>/services/utils';
import { dbApi } from '>/services/api';
import { Login, DialogContent, dialogFactories } from '>/modules';
import { queryClient } from '>/config/reactQuery';
import { CommonDialogHandlers } from '>/types';

export const handleLogin = (
  e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
) => {
  e.preventDefault();
  const handlers: CommonDialogHandlers = {
    confirm: () => {},
  };
  const labels = [undefined, 'Login'];
  dialogStoreActions.openDialog({
    anonymous: true,
    payload: {
      initialSize: 'md',
      caption: 'Authorization',
      component: <Login formHandlers={handlers} />,
      variant: 'error',
      actions: dialogActions
        .enabledConfirmCancel({
          onConfirm: async () => {
            await handlers.confirm();
            dialogStoreActions.closeDialog();
          },
        })
        .map((control, idx) => ({
          ...control,
          label: labels[idx] ?? control.label,
        })),
    },
  });
};

export const handleLogout = () => {
  dialogStoreActions.openDialog({
    payload: {
      caption: 'Sessions',
      component: (
        <DialogContent note='Logging Out'>
          {'Are you sure you want to terminate this session?'}
        </DialogContent>
      ),
      variant: 'warn',
      actions: dialogActions.confirmCancel({
        onConfirm: async () => {
          dialogStoreActions.closeDialog();
          const rsp = await dbApi.logout();
          sessionStorage.setItem('can-restore', 'false');
          if (rsp.ok) {
            messageStoreActions.addMessage({
              type: 'success',
              content: {
                text: `Goodbye ${accountStoreActions.getUsername()} - ${rsp.message}`,
                duration: 3000,
              },
            });
          } else {
            messageStoreActions.addMessage({
              type: 'warn',
              content: { text: `Error: ${rsp.message} `, duration: 5000 },
            });
          }
          accountStoreActions.initialize({ online: true });
          queryClient.removeQueries();
        },
      }),
    },
  });
};

export const handleClearSession = () => {
  dialogStoreActions.openDialog({
    anonymous: true,
    payload: {
      caption: 'Sessions',
      component: (
        <DialogContent note='ClearSession'>
          <p>Are you sure you want to erase all session data?</p>
          <p>
            If you cannot login because of corrupted settings this operation
            will reset the environment.
          </p>
        </DialogContent>
      ),
      variant: 'warn',
      actions: dialogActions.confirmCancel({
        onConfirm: async () => {
          dialogStoreActions.closeDialog();
          const rsp = await dbApi.cleanup();
          sessionStorage.removeItem('can-restore');
          sessionStorage.removeItem('sessionPrefs');
          if (rsp.ok) {
            messageStoreActions.addMessage({
              type: 'info',
              content: {
                text: rsp.message,
                duration: 4000,
              },
            });
          } else {
            messageStoreActions.addMessage({
              content: {
                text: 'Failed to clear session',
                duration: 6000,
              },
            });
          }
        },
      }),
    },
  });
};

export const handlePreferences = () => {
  dialogStoreActions.openDialog({
    payload: dialogFactories.editPreferences(),
  });
};

export const handleCreateUser = () => {
  dialogStoreActions.openDialog({
    payload: dialogFactories.createUser(),
  });
};

export const handleYourPrivileges = () => {
  dialogStoreActions.openDialog({
    payload: dialogFactories.yourPrivileges(),
  });
};
