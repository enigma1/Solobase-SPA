import { makeStore } from '>/services/utils/emitter';
import { hasObjectProps, getSchemaFromSample } from '>/services/utils';
import { ServerSessionType } from '>/services/api';
import { PrimeObject } from '>/types';

export type AccountState = {
  username: string;
  dbSelected: string | null;
  isAuthenticated: boolean;
  preferences: PrimeObject;
};

export type AccountActions = {
  initialize: () => Promise<void>;
  restoreSession: (data: ServerSessionType) => { username: string } | null;
  // logout: () => Promise<unknown>;
  setDatabaseSelection: (db: string) => void;
  setAuthenticated: (value: boolean) => void;
  setSettings: (settings: PrimeObject) => void;
};

export type AccountStore = AccountState & AccountActions;

const initialState: AccountState = {
  username: '',
  dbSelected: null,
  isAuthenticated: false,
  preferences: {},
} as const;

const baseStore = makeStore<AccountState>(() => initialState);
const { get, set, setAuto } = baseStore;

export const accountActions: AccountActions = {
  initialize: async () => {
    set(() => initialState);
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
        isAuthenticated: true,
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
  setDatabaseSelection: (database) => {
    setAuto({ dbSelected: database });
  },
  setAuthenticated: (value) => setAuto({ isAuthenticated: value }),
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
  state: AccountState;
  api: AccountActions;
};

export const useAccountStore = <T = AccountStore>(
  selector?: (state: SelectorArgsType) => T,
): T => {
  const state = baseStore();
  const api = accountActions;
  return selector ? selector({ state, api }) : ({ state, api } as T);
};
