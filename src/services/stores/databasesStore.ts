import { makeStore } from '>/services/utils/emitter';
import { ScalarObject } from '>/types';

type EditedRow = Record<number, ScalarObject>;
type DatabasesState = {
  editedRow: EditedRow;
  hiddenColumns: Record<string, boolean>;
};

export type DatabasesActions = {
  initialize: () => void;
  markEditedRow: (
    row: EditedRow | ((prevState: EditedRow) => EditedRow),
  ) => void;
  setHiddenColumns: (hiddenColumns: Record<string, boolean>) => void;
};

export type DatabasesStore = DatabasesState & DatabasesActions;

const initialState: DatabasesState = {
  editedRow: {},
  hiddenColumns: {},
};

const baseStore = makeStore<DatabasesState>(() => initialState);
const { get, set, setAuto } = baseStore;

export const databasesStoreActions: DatabasesActions = {
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
  setHiddenColumns: (cols) => {
    setAuto({ hiddenColumns: { ...cols } });
  },
};

type SelectorProps = {
  state: DatabasesState;
  api: DatabasesActions;
};
export const useDatabasesStore = <TSelected = SelectorProps>(
  selector?: (args: SelectorProps) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = databasesStoreActions;
  const store = { state, api };
  return selector ? selector(store) : (store as TSelected);
};
