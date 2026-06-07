import { DialogRenderer } from './DialogRenderer';
import { useDialogStore, dialogStoreActions } from '>/services/stores';

export const GlobalDialog = () => {
  const dialog = useDialogStore(({ state }) => state.dialog);
  return (
    <DialogRenderer dialog={dialog} onClose={dialogStoreActions.closeDialog} />
  );
};
