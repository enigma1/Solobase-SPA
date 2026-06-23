import { makeStore } from '>/services/utils/emitter';

type UtilitiesState = {
  hiddenColumns: Record<string, boolean>;
  sidebarVisibility: Record<string, boolean>;
  headerVisibility: Record<string, boolean>;
  theme: string;
  sidebarWidth: number;
};

export type UtilitiesActions = {
  initialize: () => void;
  setTheme: (value: string) => void;
  getHiddenColumns: () => Record<string, boolean>;
  setHiddenColumns: (cols: Record<string, boolean>) => void;
  savePreferences: (prefs: Partial<UtilitiesState>) => void;
};

export type UtilitiesStore = UtilitiesState & UtilitiesActions;

const initialState: UtilitiesState = {
  theme: sessionStorage.getItem('dbTheme') ?? 'clean-slate',
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
};

const baseStore = makeStore<UtilitiesState>(() => ({ ...initialState }));
const { get, set, setAuto } = baseStore;

export const utilitiesStoreActions: UtilitiesActions = {
  initialize: () => {
    set(() => ({ ...initialState }));
  },
  setTheme: (value) => {
    setAuto({ theme: value });
    sessionStorage.setItem('dbTheme', value);
  },
  setHiddenColumns: (cols) => {
    setAuto({ hiddenColumns: cols });
  },
  getHiddenColumns: () => get().hiddenColumns,
  savePreferences: (settings: Partial<UtilitiesState>) => {
    setAuto({ ...settings });
  },
};

type SelectorProps = {
  state: UtilitiesState;
  api: UtilitiesActions;
};
export const useUtilitiesStore = <TSelected = SelectorProps>(
  selector?: (args: SelectorProps) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = utilitiesStoreActions;
  const store = { state, api };
  return selector ? selector(store) : (store as TSelected);
};
