import { makeStore } from '>/services/utils/emitter';
import { CollectionColumns, ScalarObject, CollectionRow } from '>/types';

type EditedRow = Record<number, ScalarObject> | Record<string, CollectionRow>;
type TablesDataState = {
  editedRow: EditedRow;
  hiddenColumns: Record<string, boolean>;
};

export type TablesDataActions = {
  initialize: () => void;
  markEditedRow: (
    row: EditedRow | ((prevState: EditedRow) => EditedRow),
  ) => void;
  // setColumnActivity: (colName: string, hide?: boolean) => void;
  setHiddenColumns: (hiddenColumns: Record<string, boolean>) => void;
};

export type TablesDataStore = TablesDataState & TablesDataActions;

export const defaultCollectionColumns = {
  _id: 'string',
  doc: {},
} satisfies CollectionColumns;

const initialState: TablesDataState = {
  editedRow: {},
  hiddenColumns: {},
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
  setHiddenColumns: (cols) => {
    setAuto({ hiddenColumns: { ...cols } });
  },
  // setColumnActivity: (colName, hide) => {
  //   setAuto((state) => {
  //     const { [colName]: removed, ...rest } = state.hiddenColumns;
  //     if (!hide) return { hiddenColumns: { ...rest } };
  //     return {
  //       hiddenColumns: {
  //         ...state.hiddenColumns,
  //         [colName]: hide,
  //       },
  //     };
  //   });
  // },
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
