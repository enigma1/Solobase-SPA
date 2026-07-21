import { useState, useEffect } from 'react';
import {
  configStoreActions,
  queriesStoreActions,
  historyStoreActions,
  messageStoreActions,
  useAccountStore,
} from '>/services/stores';
import { useLoadPreferences } from '>/services/queryHooks';
import { ScreenLoader } from '>/modules';

export const AppBootstrap = ({ children }: { children: React.ReactNode }) => {
  const [bootstrap, setBootstrap] = useState<boolean>(false);
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  const { userPrefs, isFetched, isFetching } = useLoadPreferences(
    ({ state, query }) => ({
      userPrefs: state.userPrefs,
      isSuccess: query.isSuccess,
      isFetching: query.isFetching,
      isFetched: query.isFetched,
    }),
  );

  const ready = !isAuthenticated || (isFetched && !isFetching);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      setBootstrap(true);
      return;
    }
    if (!userPrefs) {
      configStoreActions.savePreferences();
      configStoreActions.setTheme();
      setBootstrap(true);
      return;
    }
    const { queries, copiedRows, ...mainPrefs } = userPrefs;
    configStoreActions.savePreferences(mainPrefs);
    configStoreActions.setTheme(mainPrefs.theme);
    queriesStoreActions.setQueries(queries);
    historyStoreActions.setCopiedRows(copiedRows);
    setBootstrap(true);
    messageStoreActions.addMessage({
      type: 'success',
      content: {
        text: `User preferences set`,
        duration: 3000,
      },
    });
  }, [userPrefs, ready, isAuthenticated]);

  if (!bootstrap) {
    return <ScreenLoader />;
  }
  return children;
};
