import { useEffect } from 'react';
import {
  configStoreActions,
  queriesStoreActions,
  historyStoreActions,
  messageStoreActions,
} from '>/services/stores';
import { useLoadPreferences } from '>/services/queryHooks';

export const AppBootstrap = () => {
  const { userPrefs, isSuccess } = useLoadPreferences(({ state, query }) => ({
    userPrefs: state.userPrefs,
    isSuccess: query.isSuccess,
  }));

  useEffect(() => {
    if (!isSuccess) return;
    if (!userPrefs) {
      configStoreActions.savePreferences();
      configStoreActions.setTheme();
      return;
    }
    const { queries, copiedRows, ...mainPrefs } = userPrefs;
    configStoreActions.savePreferences(mainPrefs);
    configStoreActions.setTheme(mainPrefs.theme);
    queriesStoreActions.setQueries(queries);
    historyStoreActions.setCopiedRows(copiedRows);
    messageStoreActions.addMessage({
      type: 'success',
      content: {
        text: `User preferences loaded`,
        duration: 3000,
      },
    });
  }, [isSuccess, userPrefs]);

  return null;
};
