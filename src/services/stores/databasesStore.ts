import { makeStore } from '>/services/utils/emitter';
import { SqlObject } from '>/types';

type EditedRow = Record<number, SqlObject>;
type DatabasesState = {
  editedRow: EditedRow;
};

export type DatabasesActions = {
  initialize: () => void;
  markEditedRow: (
    row: EditedRow | ((prevState: EditedRow) => EditedRow),
  ) => void;
};

export type DatabasesStore = DatabasesState & DatabasesActions;

const initialState: DatabasesState = {
  editedRow: {},
};

const baseStore = makeStore<DatabasesState>(() => ({ ...initialState }));
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
