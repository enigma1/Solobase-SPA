import { makeStore, makeFactoryStore } from '>/services/utils/emitter';

type WithUiKey = {
  uiKey: number;
};
type UiTableState = {
  selectedRows: Set<number>;
};

export type UiTableActions = {
  initialize: () => void;
  clearSelected: () => void;
  setAllRows: (rows: WithUiKey[]) => void;
  setSelectedRow: (row: number, active: boolean) => void;
};

// export type UiTableStore = UiTableState & UiTableActions;

// const initialState: UiTableState = {
//   selectedRows: new Set<number>(),
// };

export type UiTableStore = {
  useStore: <
    TSelected = {
      state: UiTableState;
      api: UiTableActions;
    },
  >(
    selector?: (args: {
      state: UiTableState;
      api: UiTableActions;
    }) => TSelected,
  ) => TSelected;
  api: UiTableActions;
  get: () => UiTableState;
};

// const baseStore = makeFactoryStore<UiTableState>(() => initialState);
export const createUiTableStore = () => {
  const baseStore = makeFactoryStore<UiTableState>(() => ({
    selectedRows: new Set<number>(),
  }))();

  const { get, set, setAuto } = baseStore;

  const api: UiTableActions = {
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
    state: UiTableState;
    api: UiTableActions;
  };

  const useStore = <TSelected = SelectorProps>(
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
    useStore,
    get,
    api,
  };
};
