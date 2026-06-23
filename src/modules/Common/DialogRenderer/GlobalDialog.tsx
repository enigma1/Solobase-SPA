import { DialogRenderer } from './DialogRenderer';
import {
  useDialogStore,
  accountStoreActions,
  dialogStoreActions,
} from '>/services/stores';

export const GlobalDialog = () => {
  const dialog = useDialogStore(({ state }) => state.dialog);
  // const dialog = dialogStoreActions.getActive();
  const isAuthenticated = accountStoreActions.getAuthenticated();
  if (!isAuthenticated && dialog && !dialog.anonymous) return null;
  return (
    <DialogRenderer dialog={dialog} onClose={dialogStoreActions.closeDialog} />
  );
};
