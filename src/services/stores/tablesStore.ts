import { makeStore } from '>/services/utils/emitter';
import { CollectionColumns, ScalarObject, CollectionRow } from '>/types';

type EditedRow = Record<number, ScalarObject> | Record<string, CollectionRow>;
type TablesState = {
  activeTable: string | null;
  editedRow: EditedRow;
};

export type TablesActions = {
  initialize: () => void;
  setActiveTable: (selected: string | null) => void;
  markEditedRow: (
    row: EditedRow | ((prevState: EditedRow) => EditedRow),
  ) => void;
};

export type TablesStore = TablesState & TablesActions;

export const defaultCollectionColumns = {
  _id: 'string',
  doc: {},
} satisfies CollectionColumns;

const initialState: TablesState = {
  activeTable: null,
  editedRow: {},
};

const baseStore = makeStore<TablesState>(() => initialState);
const { get, set, setAuto } = baseStore;

export const tablesStoreActions: TablesActions = {
  initialize: () => {
    set(() => ({ ...initialState }));
  },
  setActiveTable: (selected: string | null) => {
    setAuto({ activeTable: selected });
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
