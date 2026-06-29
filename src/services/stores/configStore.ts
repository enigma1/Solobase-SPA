import { apiClient } from '>/services/api/client';
import { makeStore } from '>/services/utils/emitter';

type ConfigState = {
  hiddenColumns: Record<string, boolean>;
  sidebarVisibility: Record<string, boolean>;
  headerVisibility: Record<string, boolean>;
  theme: string;
  sidebarWidth: number;
  backend: string;
};

export type ConfigActions = {
  initialize: (cfg: Partial<ConfigState>) => void;
  setTheme: (value: string) => void;
  getHiddenColumns: () => Record<string, boolean>;
  setHiddenColumns: (cols: Record<string, boolean>) => void;
  savePreferences: (prefs: Partial<ConfigState>) => void;
  setBackend: (backend?: string) => void;
  getBackend: () => string;
};

export type ConfigStore = ConfigState & ConfigActions;

const initialState: ConfigState = {
  backend: '',
  hiddenColumns: {},
  sidebarWidth: 256,
  sidebarVisibility: {
    sideDatabases: true,
    sideTables: true,
    sideQueries: true,
  },
  headerVisibility: {
    topTheme: true,
    runQuery: true,
  },
  theme: sessionStorage.getItem('dbTheme') ?? 'clean-slate',
};

// const baseStore = makeStore<ConfigState>(() => ({ ...initialState }));
const baseStore = makeStore<ConfigState>(() => ({ ...initialState }));
const { get, set, setAuto } = baseStore;

export const configStoreActions: ConfigActions = {
  initialize: (cfg) => {
    const combinedState = {
      ...initialState,
      ...cfg,
    };
    set(() => combinedState);
    apiClient.defaults.baseURL = combinedState.backend;
  },
  setTheme: (value) => {
    setAuto({ theme: value });
    sessionStorage.setItem('dbTheme', value);
  },
  setHiddenColumns: (cols) => {
    setAuto({ hiddenColumns: cols });
  },
  getHiddenColumns: () => get().hiddenColumns,

  getBackend: () => get().backend,
  setBackend: (url) => {
    setAuto({ backend: url });
    apiClient.defaults.baseURL = url;
  },

  savePreferences: (settings: Partial<ConfigState>) => {
    setAuto({ ...settings });
  },
};

type SelectorProps = {
  state: ConfigState;
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
