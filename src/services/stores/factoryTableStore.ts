import { makeFactoryStore } from '>/services/utils/emitter';

type WithUiKey = {
  uiKey: number;
};
type FactoryTableState = {
  selectedRows: Set<number>;
};

export type FactoryTableActions = {
  initialize: () => void;
  clearSelected: () => void;
  setAllRows: (rows: WithUiKey[]) => void;
  setSelectedRow: (row: number, active: boolean) => void;
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

// const baseStore = makeFactoryStore<UiTableState>(() => initialState);
export const createFactoryTableStore = () => {
  const baseStore = makeFactoryStore<FactoryTableState>(() => ({
    selectedRows: new Set<number>(),
  }))();

  const { get, set, setAuto } = baseStore;

  const api: FactoryTableActions = {
    initialize: () => {
      set(() => ({
        selectedRows: new Set(),
      }));
    },

    clearSelected: () => {
      setAuto({
        selectedRows: new Set(),
      });
    },

    setAllRows: (rows: WithUiKey[]) => {
      const selectedRows = new Set<number>(rows.map((r) => r.uiKey));
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
