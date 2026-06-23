import { dialogStoreActions, utilitiesStoreActions } from '>/services/stores';
import { dialogFactories } from '>/modules';

const changeColumnsActivePrefs = (col: string, hidden: boolean) => {
  const { [col]: removed, ...rest } = utilitiesStoreActions.getHiddenColumns();
  utilitiesStoreActions.savePreferences({
    hiddenColumns: {
      ...rest,
      ...(hidden && { [col]: true }),
    },
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
