import { queryClient } from '>/config/reactQuery';
import { queryKeys } from '>/services/queryHooks';
import {
  makeStore,
  hasObjectProps,
  defaultCapabilities,
  getSchemaFromSample,
} from '>/services/utils';
import { SessionRestoreResponse } from '>/services/api';
import { PrimeObject, UserCapabilities } from '>/types';

export type AccountStoreState = {
  username: string;
  dbSelected: string | null;
  activeTable: string | null;
  isAuthenticated: boolean;
  online: boolean;
  capabilities: UserCapabilities;
};

export type AccountStoreActions = {
  initialize: (cfg?: Partial<AccountStoreState>) => void;
  restoreSession: (data: SessionRestoreResponse) => { username: string } | null;
  // logout: () => Promise<unknown>;
  getActiveDatabase: () => string | null;
  setActiveDatabase: (db: string | null, forceUpdate?: boolean) => void;
  getActiveTable: () => string | null;
  setActiveTable: (table: string | null) => void;
  getAuthenticated: () => boolean;
  setAuthenticated: (value: boolean) => void;
  getAppStatus: () => boolean;
  setAppStatus: (value: boolean) => void;
  getUsername: () => string;
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
const { get, set, setAuto } = baseStore;

export const accountStoreActions: AccountStoreActions = {
  initialize: (cfg) => {
    set(() => ({ ...initialState, ...cfg }));
  },
  restoreSession: (data) => {
    const lastSession = hasObjectProps(data, [
      'username',
      'dbSelected',
      // 'schemas',
      // 'preferences',
    ]);

    if (lastSession) {
      setAuto({
        username: data.username,
        dbSelected: data.dbSelected,
        activeTable: null,
        isAuthenticated: true,
        online: true,
        // theme: sessionStorage.getItem('dbTheme') ?? initialState.theme,
        // preferences: data.preferences || initialState.preferences,
      });
      return { username: data.username };
    }

    set(() => initialState);
    return null;
  },
  getUsername: () => get().username,
  getActiveDatabase: () => get().dbSelected,
  setActiveDatabase: (database, forceUpdate = false) => {
    if (!database && forceUpdate) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.databases(),
        exact: true,
      });
      setAuto(
        { dbSelected: null, activeTable: null },
        { equalityKey: 'alwaysFail' },
      );
    } else {
      setAuto({ dbSelected: database, activeTable: null });
    }
  },
  getActiveTable: () => get().activeTable,
  setActiveTable: (table) => {
    setAuto({ activeTable: table });
  },

  getAuthenticated: () => get().isAuthenticated,
  setAuthenticated: (value) => setAuto({ isAuthenticated: value }),
  getAppStatus: () => get().online,
  setAppStatus: (value) => setAuto({ online: value }),
  // setSettings: (settings) => {
  //   const settingsSchema = getSchemaFromSample(settings);
  //   if (!settingsSchema.safeParse(settings).success) {
  //     console.warn('Invalid settings object, expected shape:', settingsSchema);
  //     return;
  //   }
  //   setAuto({ preferences: settings });
  // },
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
