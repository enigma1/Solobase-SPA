import { dialogStoreActions, configStoreActions } from '>/services/stores';
import { dialogFactories } from '>/modules';

const changeColumnsActivePrefs = (col: string, hidden: boolean) => {
  const { [col]: removed, ...rest } = configStoreActions.getHiddenColumns();
  configStoreActions.savePreferences({
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
        hiddenColumns: configStoreActions.getHiddenColumns(),
        columnsOrder,
        onChange: changeColumnsActivePrefs,
      },
    }),
  });
};
