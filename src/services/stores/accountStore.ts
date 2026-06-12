import { makeStore } from '>/services/utils/emitter';
import { hasObjectProps, getSchemaFromSample } from '>/services/utils';
import { SessionRestoreResponse } from '>/services/api';
import { PrimeObject } from '>/types';

export type AccountStoreState = {
  username: string;
  dbSelected: string | null;
  activeTable: string | null;
  isAuthenticated: boolean;
  online: boolean;
  preferences: PrimeObject;
  theme: string;
};

export type AccountStoreActions = {
  initialize: () => Promise<void>;
  restoreSession: (data: SessionRestoreResponse) => { username: string } | null;
  // logout: () => Promise<unknown>;
  setActiveDatabase: (db: string) => void;
  setActiveTable: (table: string) => void;
  getAuthenticated: () => boolean;
  setAuthenticated: (value: boolean) => void;
  getAppStatus: () => boolean;
  setAppStatus: (value: boolean) => void;
  setTheme: (value: string) => void;
  setSettings: (settings: PrimeObject) => void;
};

export type AccountStore = AccountStoreState & AccountStoreActions;

const initialState: AccountStoreState = {
  username: '',
  dbSelected: null,
  activeTable: null,
  isAuthenticated: false,
  online: true,
  preferences: {},
  theme: sessionStorage.getItem('dbTheme') ?? 'slate',
} as const;

const baseStore = makeStore<AccountStoreState>(() => initialState);
const { get, set, setAuto } = baseStore;

export const accountStoreActions: AccountStoreActions = {
  initialize: async () => {
    set(() => ({ ...initialState }));
  },
  restoreSession: (data) => {
    const lastSession = hasObjectProps(data, [
      'username',
      'dbSelected',
      // 'schemas',
      'preferences',
    ]);

    if (lastSession) {
      setAuto({
        username: data.username,
        dbSelected: data.dbSelected,
        activeTable: null,
        isAuthenticated: true,
        online: true,
        // theme: data.preferences?.theme || 'slate',
        theme: sessionStorage.getItem('dbTheme') ?? 'slate',
        preferences: data.preferences || initialState.preferences,
      });

      return { username: data.username };
    }

    set(() => initialState);
    return null;
  },
  // logout: async () => {
  //   set(() => initialState);
  // },
  setActiveDatabase: (database) => {
    setAuto({ dbSelected: database, activeTable: null });
  },
  setActiveTable: (table) => {
    setAuto({ activeTable: table });
  },

  getAuthenticated: () => get().isAuthenticated,
  setAuthenticated: (value) => setAuto({ isAuthenticated: value }),
  getAppStatus: () => get().online,
  setAppStatus: (value) => setAuto({ online: value }),
  setTheme: (value) => {
    setAuto({ theme: value });
    sessionStorage.setItem('dbTheme', value);
  },
  setSettings: (settings) => {
    const settingsSchema = getSchemaFromSample(settings);
    if (!settingsSchema.safeParse(settings).success) {
      console.warn('Invalid settings object, expected shape:', settingsSchema);
      return;
    }
    setAuto({ preferences: settings });
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
