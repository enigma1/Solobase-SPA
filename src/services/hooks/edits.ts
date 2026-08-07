// hooks/useUnsavedChangesBlocker.ts

import { useBlocker } from 'react-router-dom';
import { useEffect } from 'react';
import { dialogStoreActions } from '>/services/stores';
import { dialogFactories } from '>/modules';

type UnsavedChangesBlockerProps = {
  hasEdits: () => boolean;
  clearEdits: () => void;
  caption?: string;
  note?: string;
  message?: string;
};

export const useUnsavedChangesBlocker = ({
  hasEdits,
  clearEdits,
  caption = 'Switching Views',
  note = 'Existing Edits will be lost',
  message = 'You have unsaved changes. Leave this view?',
}: UnsavedChangesBlockerProps) => {
  const blocker = useBlocker(hasEdits);

  useEffect(() => {
    if (blocker.state !== 'blocked' || !hasEdits()) return;

    dialogStoreActions.openDialog({
      payload: dialogFactories.confirmation({
        caption,
        note,
        message,
        onConfirm: () => {
          dialogStoreActions.closeDialog();
          clearEdits();
          blocker.proceed();
        },
        onCancel: () => {
          dialogStoreActions.closeDialog();
          blocker.reset();
        },
      }),
    });
  }, [blocker.state, blocker, hasEdits, clearEdits, caption, note, message]);

  return blocker;
};
