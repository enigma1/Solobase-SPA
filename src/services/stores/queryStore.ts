import { makeStore } from '>/services/utils/emitter';

// rows: SqlRow[];
// cols: SqlColumns[];
// query: string;
// truncated: boolean;

type QueryState = {
  queries: {
    cols: unknown[];
    rows: unknown[];
    truncated: boolean;
    database: string;
  }[];
};

export type QueryActions = {
  initialize: () => void;
};

const initialState: QueryState = {
  queries: [],
};

const baseStore = makeStore<QueryState>(() => initialState);
const { get, set, setAuto } = baseStore;

export const queryStoreActions = {
  initialize: () => {
    set(() => ({ ...initialState }));
  },
};

type SelectorArgsType = {
  state: QueryState;
  api: QueryActions;
};
export const useQueryStore = <TSelected = QueryState>(
  selector?: (args: SelectorArgsType) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = queryStoreActions;
  return selector ? selector({ state, api }) : ({ state, api } as TSelected);
};
