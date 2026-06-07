import {
  messageStoreActions,
  dialogStoreActions,
  accountStoreActions,
} from '>/services/stores';
import { dialogActions } from '>/services/utils';
import { dbApi } from '>/services/api';
import { DialogContent } from '>/modules';

export const handleLogout = (username: string) => {
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
                text: `Goodbye ${username} - ${rsp.message}`,
                duration: 3000,
              },
            });
          } else {
            messageStoreActions.addMessage({
              type: 'warn',
              content: { text: `Error: ${rsp.message} `, duration: 3000 },
            });
          }
          accountStoreActions.initialize();
        },
      }),
    },
  });
};
