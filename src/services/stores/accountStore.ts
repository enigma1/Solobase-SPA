import {
  makeStore,
  hasObjectProps,
  defaultCapabilities,
  getSchemaFromSample,
} from '>/services/utils';
import { SessionRestoreResponse } from '>/services/api';
import { UserCapabilities } from '>/types';

type ActiveTableGuard = () => Promise<boolean>;

export type AccountStoreState = {
  username: string;
  dbSelected: string | null;
  activeTable: string | null;
  isAuthenticated: boolean;
  online: boolean;
  capabilities: string[];
  activeTableGuard?: ActiveTableGuard;
};

export type AccountStoreActions = {
  batch: (fn: () => void) => void;
  initialize: (cfg?: Partial<AccountStoreState>) => void;
  restoreSession: (data: SessionRestoreResponse) => { username: string } | null;
  getActiveDatabase: () => string | null;
  setActiveDatabase: (db: string | null) => void;
  getActiveTable: () => string | null;
  setActiveTable: (table: string | null) => void;
  getAuthenticated: () => boolean;
  setAuthenticated: (value: boolean) => void;
  getAppStatus: () => boolean;
  setAppStatus: (value: boolean) => void;
  setCapabilities: (capabilities: string[]) => void;
  getUsername: () => string;
  setUsername: (username: string) => void;
  triggerGuard: () => Promise<boolean>;
  registerActiveTableGuard: (guard: ActiveTableGuard) => () => void;
};

export type AccountStore = AccountStoreState & AccountStoreActions;

const initialState: AccountStoreState = {
  username: '',
  dbSelected: null,
  activeTable: null,
  isAuthenticated: false,
  online: false,
  capabilities: { ...defaultCapabilities },
} as const;

const baseStore = makeStore<AccountStoreState>(() => initialState);
const { get, set, setAuto, batch } = baseStore;

export const accountStoreActions: AccountStoreActions = {
  batch,
  initialize: (cfg) => {
    set(() => ({ ...initialState, ...cfg }));
  },
  restoreSession: (data) => {
    const lastSession = hasObjectProps(data, ['username', 'dbSelected']);

    if (lastSession) {
      setAuto({
        username: data.username,
        dbSelected: data.dbSelected,
        activeTable: null,
        isAuthenticated: true,
        online: true,
      });
      return { username: data.username };
    }

    set(() => initialState);
    return null;
  },
  getUsername: () => get().username,
  setUsername: (username) => {
    setAuto({ username });
  },
  getActiveDatabase: () => get().dbSelected,
  setActiveDatabase: (database) => {
    setAuto({ dbSelected: database, activeTable: null });
  },
  getActiveTable: () => get().activeTable,
  setActiveTable: (table) => {
    setAuto({
      activeTable: table,
    });
  },
  setCapabilities: (capabilities: string[]) => {
    setAuto({ capabilities });
  },

  getAuthenticated: () => get().isAuthenticated,
  setAuthenticated: (value) => setAuto({ isAuthenticated: value }),
  getAppStatus: () => get().online,
  setAppStatus: (value) => setAuto({ online: value }),
  triggerGuard: async () => {
    const guard = get().activeTableGuard;

    if (guard) {
      const allowed = await guard();

      if (!allowed) {
        return false;
      }
    }
    return true;
  },
  registerActiveTableGuard: (guard) => {
    setAuto({
      activeTableGuard: guard,
    });

    return () => {
      setAuto({
        activeTableGuard: undefined,
      });
    };
  },
};

type SelectorArgsType = {
  state: AccountStoreState;
  api: AccountStoreActions;
};

export const useAccountStore = <T = AccountStore>(
  selector?: (state: SelectorArgsType) => T,
): T => {
  const state = baseStore();
  const api = accountStoreActions;
  return selector ? selector({ state, api }) : ({ state, api } as T);
};
