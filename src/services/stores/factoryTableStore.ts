import { makeFactoryStore } from '>/services/utils/emitter';
import { PageListings, defaultPaging } from '>/services/utils';
import {
  PagingParams,
  FilterColumnParams,
  SortByParams,
  SortSelection,
  StoredColumnActions,
} from '>/types';
import { configStoreActions } from './configStore';

type WithUiKey = {
  uiKey: string;
};

type ChangeSortByProps = {
  column: string;
  direction: SortSelection;
};

type ChangeFilterProps = {
  column: string;
  filter: FilterColumnParams;
};

type FactoryTableState = {
  selectedRows: Set<string>;
  paging: PagingParams;
  sortBy: Record<string, SortByParams>;
  filters: Record<string, FilterColumnParams[]>;
};

export type FactoryTableActions = {
  initialize: () => void;
  restorePreferences: (stored: Record<string, StoredColumnActions>) => void;
  clearSelected: () => void;
  setAllRows: (rows: WithUiKey[]) => void;
  setSelectedRow: (row: string, active: boolean) => void;
  setPaging: (paging: Partial<PagingParams>) => void;
  clearFilters: () => void;
  clearSorts: () => void;
  changeSortBy: (sortParams: ChangeSortByProps) => void;
  changeFilters: (filterParams: ChangeFilterProps) => void;
};

export type FactoryTableStore = {
  useFactoryTableStore: <
    TSelected = {
      state: FactoryTableState;
      api: FactoryTableActions;
    },
  >(
    selector?: (args: {
      state: FactoryTableState;
      api: FactoryTableActions;
    }) => TSelected,
  ) => TSelected;
  api: FactoryTableActions;
  get: () => FactoryTableState;
};

type GetOptionsProps = {
  listingType?: PageListings;
};
const getPageOptions = ({ listingType }: GetOptionsProps) => {
  const paging = configStoreActions.getPageSizes();
  return {
    ...(listingType && { limit: paging[listingType] }),
  };
};

// const baseStore = makeFactoryStore<UiTableState>(() => initialState);
export const createFactoryTableStore = (options: GetOptionsProps) => {
  const baseStore = makeFactoryStore<FactoryTableState>(() => ({
    selectedRows: new Set<string>(),
    paging: {
      ...defaultPaging,
      ...getPageOptions(options),
    },
    sortBy: {},
    filters: {},
  }))();

  const { get, set, setAuto } = baseStore;

  const api: FactoryTableActions = {
    initialize: () => {
      set(() => ({
        selectedRows: new Set<string>(),
        paging: {
          ...defaultPaging,
          ...getPageOptions(options),
        },
        sortBy: {},
        filters: {},
      }));
    },

    restorePreferences: (stored: Record<string, StoredColumnActions>) => {
      setAuto(() => {
        const filters: Record<string, FilterColumnParams[]> = {};
        const sortBy: Record<string, SortByParams> = {};

        for (const [column, pref] of Object.entries(stored)) {
          if (pref.filters?.length) {
            filters[column] = pref.filters;
          }

          if (pref.sort && pref.sort !== 'both') {
            sortBy[column] = {
              direction: pref.sort,
            };
          }
        }

        return {
          filters,
          sortBy,
        };
      });
    },
    clearSelected: () => {
      setAuto({
        selectedRows: new Set(),
      });
    },

    setAllRows: (rows: WithUiKey[]) => {
      const selectedRows = new Set<string>(rows.map((r) => r.uiKey));
      setAuto({ selectedRows });
    },

    setSelectedRow: (row, active) => {
      setAuto((prev) => {
        const next = new Set(prev.selectedRows);
        if (active) {
          next.add(row);
        } else {
          next.delete(row);
        }

        return {
          ...prev,
          selectedRows: next,
        };
      });
    },
    setPaging: (paging) => {
      setAuto((prev) => ({
        paging: {
          ...prev.paging,
          ...paging,
        },
      }));
    },
    changeSortBy: ({ column, direction }) => {
      setAuto((prev) => {
        const current = prev.sortBy ?? {};

        const { [column]: _, ...rest } = current;

        return {
          sortBy:
            direction === 'both'
              ? rest
              : {
                  ...rest,
                  [column]: {
                    direction,
                  },
                },
        };
      });
    },
    changeFilters: ({ column, filter }) => {
      setAuto((prev) => {
        const current = prev.filters ?? {};
        const columnFilters = current[column] ?? [];

        const nextColumnFilters =
          filter.value !== undefined
            ? [...columnFilters.filter((f) => f.mode !== filter.mode), filter]
            : columnFilters.filter((f) => f.mode !== filter.mode);
        const { [column]: _, ...rest } = current;

        return {
          filters: nextColumnFilters.length
            ? {
                ...rest,
                [column]: nextColumnFilters,
              }
            : rest,

          paging: {
            ...prev.paging,
            offset: 0,
          },
        };
      });
    },

    clearFilters: () => {
      setAuto({ filters: {} });
    },
    clearSorts: () => {
      setAuto({ sortBy: {} });
    },
  };

  type SelectorProps = {
    state: FactoryTableState;
    api: FactoryTableActions;
  };

  const useFactoryTableStore = <TSelected = SelectorProps>(
    selector?: (args: SelectorProps) => TSelected,
  ): TSelected => {
    const state = baseStore();

    const store = {
      state,
      api,
    };

    return selector ? selector(store) : (store as TSelected);
  };

  // useStore() - classic reactive UI hook with selector pattern
  // get() read only state to use with component action/handlers to avoid re-renders
  // api - state mutations
  // Usage: const store = createUiTableStore()
  // const {useStore, api} = store
  // or const prop = store.get().stateProperty
  return {
    useFactoryTableStore,
    get,
    api,
  };
};
