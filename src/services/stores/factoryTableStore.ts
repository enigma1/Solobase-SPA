import { makeFactoryStore } from '>/services/utils/emitter';
import { defaultPaging } from '>/services/utils';
import type { PageListings } from '>/contracts';
import type { PagingParams, SqlObject } from '>/types';
import { configStoreActions } from './configStore';

type EditedRow = Record<number, SqlObject> | Record<string, SqlObject>;

type WithUiKey = {
  uiKey: string;
};

type FactoryTableState = {
  selectedRows: Set<string>;
  paging: PagingParams;
  editedRow: EditedRow;
};

export type FactoryTableActions = {
  initialize: () => void;
  clearSelected: () => void;
  setAllRows: (rows: WithUiKey[]) => void;
  setSelectedRow: (row: string, active: boolean) => void;
  setPaging: (paging: Partial<PagingParams>) => void;
  markEditedRow: (
    row: EditedRow | ((prevState: EditedRow) => EditedRow),
  ) => void;
  hasEdits: () => boolean;
  clearEdits: () => void;
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
    editedRow: {},
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
        editedRow: {},
      }));
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

    clearSelected: () => {
      setAuto({
        selectedRows: new Set(),
      });
    },
    markEditedRow: (objOrFn) => {
      setAuto((state) => {
        const nextEditedRow =
          typeof objOrFn === 'function' ? objOrFn(state.editedRow) : objOrFn;

        return { editedRow: nextEditedRow };
      });
    },
    clearEdits: () => {
      setAuto({
        editedRow: {},
      });
    },
    hasEdits: () => {
      return Object.keys(get().editedRow).length > 0;
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
