import {
  messageStoreActions,
  dialogStoreActions,
  accountStoreActions,
} from '>/services/stores';
import { dialogActions } from '>/services/utils';
import { dbApi } from '>/services/api';
import { DialogContent, dialogFactories } from '>/modules';

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
          accountStoreActions.initialize();
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

export const handleNewUser = () => {
  dialogStoreActions.openDialog({
    payload: dialogFactories.newUser(),
  });
};

export const handleYourPrivileges = () => {
  dialogStoreActions.openDialog({
    payload: dialogFactories.yourPrivileges(),
  });
};
