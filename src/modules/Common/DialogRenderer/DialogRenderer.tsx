import { DialogState } from '>/types';
import { DialogComponent } from './Maps/DialogComponent';

export type DialogRendererProps = {
  dialog: DialogState | null;
  onClose: () => void;
};

export const DialogRenderer = ({ dialog, onClose }: DialogRendererProps) => {
  if (!dialog) return null;

  return <DialogComponent payload={dialog.payload} onClose={onClose} />;
};
