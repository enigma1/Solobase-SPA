import { makeStore } from '>/services/utils/emitter';
import { trimString } from '>/services/utils';

type QueryEntry = {
  id: string;
  original: string;
  modified: string | null;
  database: string;
};

export type HistoryState = {
  queriesObj: Record<string, QueryEntry>;
  queryIds: string[];
  selectedQuery: string | null;
  searches: string[];
};

const initialState: HistoryState = {
  queriesObj: {},
  queryIds: [],
  searches: [],
  selectedQuery: null,
};

const baseStore = makeStore<HistoryState>(() => initialState);
const { get, setAuto } = baseStore;
export type HistoryActions = {
  updateOriginal: ({ id, original }: { id: string; original: string }) => void;
  updateModified: ({ id, modified }: { id: string; modified: string }) => void;
};

const actions: HistoryActions = {
  updateOriginal: ({ id, original }) => {
    setAuto((state) => ({
      queriesObj: {
        ...state.queriesObj,
        [id]: { ...state.queriesObj[id], original, modified: null },
      },
    }));
  },
  updateModified: ({ id, modified }) => {
    setAuto((state) => ({
      queriesObj: {
        ...state.queriesObj,
        [id]: {
          ...state.queriesObj[id],
          modified,
        },
      },
    }));
  },
};

type SelectorArgsType = {
  state: HistoryState;
  api: HistoryActions;
};
export const useHistoryStore = <T = HistoryState>(
  selector?: (args: SelectorArgsType) => T,
): T => {
  const state = baseStore();
  const api = actions;
  return selector ? selector({ state, api }) : ({ state, api } as T);
};
