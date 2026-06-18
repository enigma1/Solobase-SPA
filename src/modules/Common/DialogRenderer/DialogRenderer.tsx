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
// export const ErrorItem = ({ error }: { error: BasicRecord }) => (
//   <div className='rounded p-4 space-y-1'>
//     <div className='font-semibold'>{error.title}</div>
//     <div className='text-sm opacity-70'>{error.msg}</div>
//   </div>
// );
