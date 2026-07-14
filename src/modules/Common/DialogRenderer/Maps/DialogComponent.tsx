import { ReactNode, SyntheticEvent, useState } from 'react';
import { ModalDialog } from '>/modules';
import { DialogPayload, ButtonStatus } from '>/types';
import { ModalContext } from '>/services/hooks';

type DialogComponentProps = {
  payload: DialogPayload;
  onClose: (e?: SyntheticEvent<HTMLDialogElement>) => void;
};

export const DialogComponent = ({ payload, onClose }: DialogComponentProps) => {
  const initialStatuses =
    payload?.actions?.reduce(
      (acc, action) => {
        if (!action.id || !action.status) return acc;

        acc[action.id] = action.status;
        return acc;
      },
      {} as Record<string, ButtonStatus>,
    ) ?? {};

  const [buttonsStatus, setButtonsStatus] =
    useState<Record<string, ButtonStatus>>(initialStatuses);

  // Setup Setters
  const setButtonStatus = (id: string, status?: ButtonStatus) => {
    setButtonsStatus((prev) => {
      const next = { ...prev };
      if (status === undefined) {
        delete next[id];
      } else {
        next[id] = status;
      }
      return next;
    });
  };

  const setButtonsStatuses = (
    updates: Partial<Record<string, ButtonStatus>>,
  ) => {
    setButtonsStatus((prev) => {
      const next = { ...prev };

      for (const [id, status] of Object.entries(updates)) {
        if (status === undefined) {
          delete next[id];
        } else {
          next[id] = status;
        }
      }

      return next;
    });
  };

  const buttons: ReactNode[] =
    payload?.actions?.map((a, idx) => {
      const status = a.id ? buttonsStatus[a.id] : undefined;
      return (
        <button
          key={`${a.label}-${idx}`}
          onClick={a.onClick}
          className={`${a.classes ?? 'btn-secondary'}`}
          data-status={status ?? 'active'}
        >
          {a.label}
        </button>
      );
    }) ?? [];
  return (
    <ModalContext.Provider
      value={{
        onClose,
        variant: payload.variant,
        initialSize: payload.initialSize,
        buttonsStatus,
        setButtonStatus,
        setButtonsStatuses,
      }}
    >
      <ModalDialog
        onClose={payload.onCancel ?? onClose}
        caption={payload.caption}
        content={payload.component}
        controls={buttons}
      />
    </ModalContext.Provider>
  );
};
