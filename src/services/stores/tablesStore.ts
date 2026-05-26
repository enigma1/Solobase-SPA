import { makeStore } from '>/services/utils/emitter';
import { CollectionColumns, ScalarObject, CollectionRow } from '>/types';

type EditedRow = Record<number, ScalarObject>;
type TablesState = {
  editedRow: EditedRow;
};

export type TablesActions = {
  initialize: () => void;
  markEditedRow: (
    row: EditedRow | ((prevState: EditedRow) => EditedRow),
  ) => void;
};

export type TablesStore = TablesState & TablesActions;

const initialState: TablesState = {
  editedRow: {},
};

const baseStore = makeStore<TablesState>(() => initialState);
const { get, set, setAuto } = baseStore;

export const tablesStoreActions: TablesActions = {
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
  state: TablesState;
  api: TablesActions;
};
export const useTablesStore = <TSelected = SelectorProps>(
  selector?: (args: SelectorProps) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = tablesStoreActions;
  const store = { state, api };
  return selector ? selector(store) : (store as TSelected);
};
