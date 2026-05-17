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
  addQuery: ({
    query,
    modified,
    database,
  }: {
    query: string;
    modified?: string;
    database: string;
  }) => string;
  getQuery: (id?: string) => Readonly<QueryEntry> | null;
  addSearch: (search: string) => void;
  setQuerySelection: (id: string | null) => void;
  removeQuery: (id: string) => void;
  updateOriginal: ({ id, original }: { id: string; original: string }) => void;
  updateModified: ({ id, modified }: { id: string; modified: string }) => void;
};

const actions: HistoryActions = {
  getQuery: (id) => {
    const state = get();
    const queryId = id ?? state.selectedQuery;
    return queryId ? state.queriesObj[queryId] : null;
  },
  addQuery: ({ query, modified, database }) => {
    const trimmedQuery = trimString(query);
    const existingEntry = Object.values(get().queriesObj).find(
      (q) => q.original === trimmedQuery && q.database === database,
    );
    if (existingEntry) {
      return existingEntry.id;
    }
    const newId = crypto.randomUUID();
    setAuto((state) => ({
      queriesObj: {
        ...state.queriesObj,
        [newId]: {
          database,
          id: newId,
          original: trimmedQuery,
          modified: modified ?? null,
        },
      },
      queryIds: [...state.queryIds, newId],
    }));
    return newId;
  },
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
  addSearch: (search) => {
    setAuto((state) => ({
      searches: [...state.searches, search],
    }));
  },
  setQuerySelection: (id: string | null) => {
    setAuto({ selectedQuery: id });
  },
  removeQuery: (id: string) => {
    setAuto((state) => {
      const { [id]: removed, ...rest } = state.queriesObj;
      return {
        queriesObj: rest,
        queryIds: state.queryIds.filter((qid) => qid !== id),
        ...(state.selectedQuery === id && { selectedQuery: null }),
      };
    });
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
