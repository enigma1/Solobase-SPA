import type { ReactNode, SyntheticEvent } from 'react';

export type DialogVariants = 'success' | 'error' | 'info' | 'warn';
export type ButtonStatus = 'hidden' | 'disabled';

export type DialogAction =
  | {
      label: string;
      classes?: string;
      onClick: () => void;
      id?: never;
      status?: never;
    }
  | {
      id: string;
      label: string;
      classes?: string;
      onClick: () => void;
      status?: ButtonStatus;
    };

export type DialogSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
export type DialogPayload = {
  caption: ReactNode;
  component: ReactNode;
  actions?: DialogAction[];
  variant?: DialogVariants;
  initialSize?: DialogSizes;
  onCancel?: (e?: SyntheticEvent<HTMLDialogElement>) => void;
};

export type DialogState = {
  anonymous?: boolean;
  payload: DialogPayload;
};

export type WizardHandlers = {
  next?: () => void;
  previous?: () => void;
  skip?: () => void;
  finish?: () => void | Promise<void>;
};

export type ComponentFormHandlers = {
  formHandlers: CommonDialogHandlers;
};

export type CommonDialogHandlers = {
  confirm: () => void | Promise<void>;
  close?: () => void;
};

export type DialogMap<T extends { type: string; payload: unknown }> = {
  [K in T['type']]: (
    payload: Extract<T, { type: K }>['payload'],
    onClose: () => void,
  ) => ReactNode;
};

export type DialogStore = {
  dialog: DialogState | null;
};
