import cloneDeep from 'lodash-es/cloneDeep';
import { makeStore, userPrefs, backPath } from '>/services/utils';
import { loadExternalTheme } from '>/services/customized';
import { apiClient } from '>/services/api/client';
import type { PageListings } from '>/contracts';
import { fullBackendUrl } from '>/config';
import type { StorageConfig, SidebarVisibilityTypes } from '>/types';

export type ConfigActions = {
  setTheme: (value?: string) => Promise<void>;
  setHeaderVisibility: (visible: boolean) => void;
  setSidebarVisibility: (visibility: SidebarVisibilityTypes) => void;
  getPreferences: () => StorageConfig;
  savePreferences: (prefs?: Partial<StorageConfig>) => void;
  setBackport: (backport?: number, updateClient?: boolean) => void;
  getBackport: () => number;
  setFrontPort: (port?: number) => void;
  getFrontPort: () => number;
  getPageSizes: () => Record<PageListings, number>;
  showSystemDatabases: (show: boolean) => void;
  showObjectEditorForJson: (show: boolean) => void;
};

export type ConfigStore = StorageConfig & ConfigActions;

const initialState: StorageConfig = userPrefs;

const baseStore = makeStore<StorageConfig>(() => {
  apiClient.defaults.baseURL =
    fullBackendUrl ?? `${backPath}:${userPrefs.backPort}`;
  return cloneDeep(initialState);
});
const { get, set, setAuto } = baseStore;

export const configStoreActions: ConfigActions = {
  setTheme: async (value) => {
    const theme = value ?? get().theme;
    await loadExternalTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    setAuto({ theme });
  },
  showSystemDatabases: (show) => {
    setAuto({ allowSystemDatabases: show });
  },
  showObjectEditorForJson: (show) => {
    setAuto({ objectEditorForJson: show });
  },

  getPageSizes: () => get().pageSizes,

  getBackport: () => get().backPort,
  setBackport: (port, updateClient = true) => {
    setAuto({ backPort: port });
    if (updateClient) {
      apiClient.defaults.baseURL = fullBackendUrl ?? `${backPath}:${port}`;
    }
  },
  getFrontPort: () => get().frontPort,
  setFrontPort: (port) => {
    setAuto({ frontPort: port ?? userPrefs.frontPort });
  },
  setHeaderVisibility: (visible) => {
    setAuto({ headerVisibility: visible });
  },
  setSidebarVisibility: (visibility) => {
    setAuto({ sidebarVisibility: visibility });
  },
  getPreferences: () => get(),
  savePreferences: (settings?: Partial<StorageConfig>) => {
    const modSettings = settings ?? get();
    setAuto({ ...modSettings });
  },
};

type SelectorProps = {
  state: StorageConfig;
  api: ConfigActions;
};
export const useConfigStore = <TSelected = SelectorProps>(
  selector?: (args: SelectorProps) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = configStoreActions;
  const store = { state, api };
  return selector ? selector(store) : (store as TSelected);
};
