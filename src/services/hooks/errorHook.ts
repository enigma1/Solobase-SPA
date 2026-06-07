import { dialogStoreActions } from '>/services/stores';

export const useErrorDialog = () => {
  const withErrorDialog = async <T>(
    fn: () => Promise<T>,
    title: string,
    type: string,
  ): Promise<T | undefined> => {
    try {
      return await fn();
    } catch (error) {
      const err = error as Error;
      dialogStoreActions.openDialog({
        type,
        payload: {
          error: { title, msg: err.message },
          onClear: dialogStoreActions.closeDialog,
        },
      });
      return undefined;
    }
  };
  return { withErrorDialog };
};
