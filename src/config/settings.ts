import {
  configStoreActions,
  historyStoreActions,
  queriesStoreActions,
} from '>/services/stores';

export const demoMode = import.meta.env.VITE_DEMO_MODE === '1';
export const getAppConfig = () => (window as any).APP_CONFIG;
export const getPrefs = () => ({
  ...getAppConfig().userPrefs,
  ...configStoreActions.getPreferences(),
  ...{ copiedRows: historyStoreActions.getCopiedRows() },
  ...{ queries: queriesStoreActions.getQueries() },
});
