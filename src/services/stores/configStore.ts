import { makeStore, userPrefs, backPath } from '>/services/utils';
import { loadExternalTheme } from '>/services/customized';
import { apiClient } from '>/services/api/client';
import type { PageListings } from '>/services/utils/appSettings';
import { fullBackendUrl } from '>/config';
import { hasit } from '>/services/utils';
import type {
  StorageConfig,
  SidebarVisibilityTypes,
  SqlColumnsShape,
  StoredColumnActions,
  SortByParams,
  FilterColumnParams,
} from '>/types';

export type ConfigActions = {
  setTheme: (value?: string) => Promise<void>;
  getHiddenColumns: () => Record<string, boolean>;
  setHiddenColumns: (cols: Record<string, boolean>) => void;
  getPastColumnsActions: (
    cols?: SqlColumnsShape,
  ) => Record<string, StoredColumnActions>;
  getSortBy: (cols?: SqlColumnsShape) => Record<string, SortByParams>;
  getFilters: (cols?: SqlColumnsShape) => Record<string, FilterColumnParams[]>;

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
  return {
    ...initialState,
  };
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

  setHiddenColumns: (cols) => {
    setAuto({ hiddenColumns: cols });
  },
  getHiddenColumns: () => get().hiddenColumns,
  getPastColumnsActions: (cols) => {
    const pastColumns = get().pastColumnsActions;
    if (!cols) {
      return pastColumns;
    }
    const hiddenColumns = get().hiddenColumns;
    const filteredColumns = Object.keys(cols).filter((c) => !hiddenColumns[c]);

    return filteredColumns.reduce(
      (acc, cName) => {
        const stored = pastColumns[cName];

        if (
          !stored ||
          !hasit({
            input: cols[cName].type,
            parts: [stored.type],
          })
        ) {
          return acc;
        }

        acc[cName] = stored;

        return acc;
      },
      {} as Record<string, StoredColumnActions>,
    );
  },
  getSortBy: (cols) => {
    const pastColumns = get().pastColumnsActions;
    const columns = cols
      ? Object.keys(cols).filter((c) => !get().hiddenColumns[c])
      : Object.keys(pastColumns);

    return columns.reduce(
      (acc, column) => {
        const stored = pastColumns[column];

        if (!stored) {
          return acc;
        }

        if (
          cols &&
          !hasit({
            input: cols[column].type,
            parts: [stored.type],
          })
        ) {
          return acc;
        }

        if (stored.sort === 'asc' || stored.sort === 'desc') {
          acc[column] = {
            direction: stored.sort,
          };
        }

        return acc;
      },
      {} as Record<string, SortByParams>,
    );
  },
  getFilters: (cols) => {
    const pastColumns = get().pastColumnsActions;
    const columns = cols
      ? Object.keys(cols).filter((c) => !get().hiddenColumns[c])
      : Object.keys(pastColumns);

    return columns.reduce(
      (acc, column) => {
        const stored = pastColumns[column];

        if (!stored) {
          return acc;
        }

        if (
          cols &&
          !hasit({
            input: cols[column].type,
            parts: [stored.type],
          })
        ) {
          return acc;
        }

        if (stored.filters?.length) {
          acc[column] = stored.filters;
        }

        return acc;
      },
      {} as Record<string, FilterColumnParams[]>,
    );
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
