import { ReactNode } from 'react';
import { DialogState } from '>/types';

export type BasicRecord = {
  title: string;
  msg: string | undefined;
};

type DialogMapFieldOutput = Record<string, () => ReactNode>;
type DialogMapFieldProps<TPayload = Record<string, unknown>> = {
  payload?: TPayload;
  onClose: () => void;
};
type DialogMap = (props: DialogMapFieldProps) => DialogMapFieldOutput;

export type DialogRendererProps = {
  dialog: DialogState | null;
  onClose: () => void;
  map: DialogMap;
};

export const DialogRenderer = ({
  dialog,
  onClose,
  map,
}: DialogRendererProps) => {
  if (!dialog) return null;

  const dialogMap = map({
    payload: dialog.payload ?? undefined,
    onClose,
  });

  const renderer = dialogMap[dialog.type];
  return renderer ? renderer() : null;
};

export const ErrorItem = ({ error }: { error: BasicRecord }) => (
  <div className='border rounded p-4 space-y-1'>
    <div className='font-semibold'>{error.title}</div>
    <div className='text-sm opacity-70'>{error.msg}</div>
  </div>
);
