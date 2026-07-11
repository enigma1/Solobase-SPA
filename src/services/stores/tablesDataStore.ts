import { makeStore } from '>/services/utils/emitter';
import { SqlObject } from '>/types';

type EditedRow = Record<number, SqlObject> | Record<string, SqlObject>;
type TablesDataState = {
  editedRow: EditedRow;
};

export type TablesDataActions = {
  initialize: () => void;
  markEditedRow: (
    row: EditedRow | ((prevState: EditedRow) => EditedRow),
  ) => void;
};

export type TablesDataStore = TablesDataState & TablesDataActions;

export const defaultCollectionColumns = {};

const initialState: TablesDataState = {
  editedRow: {},
};

const baseStore = makeStore<TablesDataState>(() => ({ ...initialState }));
const { get, set, setAuto } = baseStore;

export const tablesDataStoreActions: TablesDataActions = {
  initialize: () => {
    set(() => ({ ...initialState }));
  },
  markEditedRow: (objOrFn) => {
    setAuto((state) => {
      const nextEditedRow =
        typeof objOrFn === 'function' ? objOrFn(state.editedRow) : objOrFn;

      return { editedRow: nextEditedRow };
    });
  },
};

type SelectorProps = {
  state: TablesDataState;
  api: TablesDataActions;
};
export const useTablesDataStore = <TSelected = SelectorProps>(
  selector?: (args: SelectorProps) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = tablesDataStoreActions;
  const store = { state, api };
  return selector ? selector(store) : (store as TSelected);
};
