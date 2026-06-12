import { dialogStoreActions, utilitiesStoreActions } from '>/services/stores';
import { dialogFactories } from '>/modules';

const changeColumnsActivePrefs = (col: string, hidden: boolean) => {
  utilitiesStoreActions.setHiddenColumns((prev: Record<string, boolean>) => {
    const next = { ...prev };

    if (hidden) {
      next[col] = true;
    } else {
      delete next[col];
    }
    return next;
  });
};

export const makeColumnsActive = (columnsOrder: string[]) => {
  dialogStoreActions.openDialog({
    payload: dialogFactories.filterColumns({
      filterProps: {
        hiddenColumns: utilitiesStoreActions.getHiddenColumns(),
        columnsOrder,
        onChange: changeColumnsActivePrefs,
      },
    }),
  });
};
