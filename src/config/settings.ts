import {
  configStoreActions,
  historyStoreActions,
  queriesStoreActions,
} from '>/services/stores';

export const demoMode = import.meta.env.VITE_DEMO_MODE === '1';
// Pass this environment variable if you want directly this front end to connect to a different url
export const fullBackendUrl =
  import.meta.env.VITE_BACKEND_URL?.trim() || undefined;

export const getAppConfig = () => (window as any).APP_CONFIG;
export const getPrefs = () => ({
  ...getAppConfig().userPrefs,
  ...configStoreActions.getPreferences(),
  ...{ copiedRows: historyStoreActions.getCopiedRows() },
  ...{ queries: queriesStoreActions.getQueries() },
});
