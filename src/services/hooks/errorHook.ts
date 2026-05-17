import { useDialogStore } from '>/services/stores';

export const useErrorDialog = () => {
  const { openDialog, closeDialog } = useDialogStore(({ api }) => ({
    openDialog: api.openDialog,
    closeDialog: api.closeDialog,
  }));

  const withErrorDialog = async <T>(
    fn: () => Promise<T>,
    title: string,
    type: string,
  ): Promise<T | undefined> => {
    try {
      return await fn();
    } catch (error) {
      const err = error as Error;
      openDialog({
        type,
        payload: {
          error: { title, msg: err.message },
          onClear: closeDialog,
        },
      });
      return undefined;
    }
  };
  return { withErrorDialog };
};
