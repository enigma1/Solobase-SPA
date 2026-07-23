import { makeStore, userPrefs, backPath } from '>/services/utils';
import { apiClient } from '>/services/api/client';
import { PageListings } from '>/services/utils/appSettings';
import { fullBackendUrl } from '>/config';
import { StorageConfig, SidebarVisibilityTypes } from '>/types';

export type ConfigActions = {
  setTheme: (value?: string) => void;
  getHiddenColumns: () => Record<string, boolean>;
  setHiddenColumns: (cols: Record<string, boolean>) => void;
  setHeaderVisibility: (visible: boolean) => void;
  setSidebarVisibility: (visibility: SidebarVisibilityTypes) => void;
  getPreferences: () => StorageConfig;
  savePreferences: (prefs?: Partial<StorageConfig>) => void;
  setBackport: (backport?: number, updateClient?: boolean) => void;
  getBackport: () => number;
  setFrontPort: (port?: number) => void;
  getFrontPort: () => number;
  getPageSizes: () => Record<PageListings, number>;
};

export type ConfigStore = StorageConfig & ConfigActions;

const initialState: StorageConfig = userPrefs;

const baseStore = makeStore<StorageConfig>(() => {
  apiClient.defaults.baseURL =
    fullBackendUrl ?? `${backPath}:${userPrefs.backPort}`;
  return {
    ...initialState,
  };
});
const { get, set, setAuto } = baseStore;

export const configStoreActions: ConfigActions = {
  setTheme: (value) => {
    const theme = value ?? get().theme;
    document.documentElement.setAttribute('data-theme', theme);
    setAuto({ theme });
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
