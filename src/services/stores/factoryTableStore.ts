import { makeFactoryStore } from '>/services/utils/emitter';
import { PagingParams } from '>/types';
import { PageListings, defaultPaging } from '>/services/utils';
import { configStoreActions } from './configStore';

type WithUiKey = {
  uiKey: string;
};

type FactoryTableState = {
  selectedRows: Set<string>;
  paging: PagingParams;
};

export type FactoryTableActions = {
  initialize: () => void;
  clearSelected: () => void;
  setAllRows: (rows: WithUiKey[]) => void;
  setSelectedRow: (row: string, active: boolean) => void;
  setPaging: (paging: Partial<PagingParams>) => void;
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
const getOptions = ({ listingType }: GetOptionsProps) => {
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
      ...getOptions(options),
    },
  }))();

  const { get, set, setAuto } = baseStore;

  const api: FactoryTableActions = {
    initialize: () => {
      configStoreActions.getPreferences();
      set(() => ({
        selectedRows: new Set<string>(),
        paging: {
          ...defaultPaging,
          ...getOptions(options),
        },
      }));
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
