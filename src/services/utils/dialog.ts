import { DialogAction } from '>/types';
import { dialogStoreActions } from '>/services/stores';

export const dialogSizes = {
  xs: 'w-[20vw] h-[35vh]',
  sm: 'w-[30vw] h-[45vh]',
  md: 'w-[40vw] h-[60vh]',
  lg: 'w-[55vw] h-[75vh]',
  xl: 'w-[70vw] h-[85vh]',
  xxl: 'w-[80vw] h-[90vh]',
  full: 'w-[95vw] h-[95vh]',
};

type ConfirmProps = {
  onConfirm: () => void;
  onCancel?: () => void;
};

type WizardProps = {
  onFinish: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onCancel?: () => void;
};

export const dialogActions = {
  ack: (): DialogAction[] => [
    {
      label: 'OK',
      onClick: dialogStoreActions.closeDialog,
    },
  ],
  confirmCancel: ({ onConfirm, onCancel }: ConfirmProps): DialogAction[] => [
    {
      label: 'Cancel',
      classes: 'btn-secondary',
      onClick: onCancel ?? dialogStoreActions.closeDialog,
    },
    {
      label: 'Confirm',
      classes: 'btn',
      onClick: onConfirm,
    },
  ],

  enabledConfirmCancel: ({
    onConfirm,
    onCancel,
  }: ConfirmProps): DialogAction[] => [
    {
      label: 'Cancel',
      classes: 'btn-secondary',
      onClick: onCancel ?? dialogStoreActions.closeDialog,
    },
    {
      id: 'confirm',
      label: 'Confirm',
      classes: 'btn',
      onClick: onConfirm,
      status: 'disabled',
    },
  ],

  wizard: ({
    onNext,
    onPrevious,
    onFinish,
    onCancel,
  }: WizardProps): DialogAction[] => [
    {
      label: 'Cancel',
      classes: 'btn-secondary',
      onClick: onCancel ?? dialogStoreActions.closeDialog,
    },
    {
      id: 'previous',
      label: 'Previous',
      classes: 'btn-secondary',
      onClick: onPrevious,
      status: 'hidden',
    },
    {
      id: 'next',
      label: 'Next',
      classes: 'btn',
      onClick: onNext,
      status: 'disabled',
    },
    {
      id: 'finish',
      label: 'Finish',
      classes: 'btn',
      onClick: onFinish,
      status: 'hidden',
    },
  ],
};
