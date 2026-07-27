import {
  configStoreActions,
  historyStoreActions,
  queriesStoreActions,
  dialogStoreActions,
} from '>/services/stores';
import {
  createResourceLoadError,
  handleLocalRequests,
} from '>/services/customized';

import type { ThemeItem } from '>/types';

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

export const customThemes: ThemeItem[] = [];

const loadCustomThemes = async () => {
  const response = await handleLocalRequests(() =>
    fetch('/extras/themes/manifest.json'),
  );
  const themes = (await response?.json()) as ThemeItem[];
  if (themes) {
    customThemes.push(...themes);
  }

  // try {
  //   const response = await fetch('/extras/themes/manifest.json');

  //   if (!response.ok) {
  //     throw new Error(`Unable to load themes manifest: ${response.status}`);
  //   }
  //   const themes = (await response.json()) as ThemeItem[];

  //   customThemes.push(...themes);
  // } catch (e) {
  //   const loadError = createResourceLoadError(
  //     'Could not locate external themes',
  //     'resource',
  //   );
  //   dialogStoreActions.setError(loadError);
  // }
};
export const customThemesReady = loadCustomThemes();
