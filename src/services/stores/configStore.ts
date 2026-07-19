import {
  makeStore,
  userPrefs,
  loadStoredPreferences,
  storePreferences,
  backPath,
} from '>/services/utils';
import { apiClient } from '>/services/api/client';
import { StorageConfig, SidebarVisibilityTypes } from '>/types';
import { PageListings } from '>/services/utils/appSettings';

export type ConfigActions = {
  setTheme: (value?: string) => void;
  getHiddenColumns: () => Record<string, boolean>;
  setHiddenColumns: (cols: Record<string, boolean>) => void;
  setHeaderVisibility: (visible: boolean) => void;
  setSidebarVisibility: (visibility: SidebarVisibilityTypes) => void;
  getPreferences: () => StorageConfig;
  savePreferences: (prefs?: Partial<StorageConfig>) => void;
  // restorePreferences: (defaultsOnly: boolean) => void;
  setBackport: (backport?: number, updateClient?: boolean) => void;
  getBackport: () => number;
  setFrontPort: (port?: number) => void;
  getFrontPort: () => number;
  getPageSizes: () => Record<PageListings, number>;
};

export type ConfigStore = StorageConfig & ConfigActions;

const initialState: StorageConfig = userPrefs;

const baseStore = makeStore<StorageConfig>(() => {
  apiClient.defaults.baseURL = `${backPath}:${userPrefs.backPort}`;
  return {
    ...initialState,
    // ...loadStoredPreferences(),
  };
});
const { get, set, setAuto } = baseStore;

export const configStoreActions: ConfigActions = {
  setTheme: (value) => {
    const theme = value ?? get().theme;
    document.documentElement.setAttribute('data-theme', theme);
    value && setAuto({ theme: value });
  },
  setHiddenColumns: (cols) => {
    setAuto({ hiddenColumns: cols });
  },
  getHiddenColumns: () => get().hiddenColumns,
  getPageSizes: () => get().pageSizes,

  getBackport: () => get().backPort,
  setBackport: (port, updateClient = true) => {
    setAuto({ backPort: port });
    if (updateClient) {
      apiClient.defaults.baseURL = `${backPath}:${port}`;
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
    // storePreferences(modSettings);
    setAuto({ ...modSettings });
  },

  // restorePreferences: (defaultsOnly = false) => {
  //   const combinedState = {
  //     ...initialState,
  //     ...(!defaultsOnly && loadStoredPreferences()),
  //   };
  //   set(() => combinedState);
  // },
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
