import { makeStore } from '>/services/utils/emitter';
import { collapseSequentialQueryDuplicates } from './helpers';
import { QueryLogEntry, QueryItem } from '>/types';

type QueriesState = {
  selectedQueryTitle?: string;
  queries: Record<string, QueryItem>;
  queriesExecuted: QueryLogEntry[];
};

export type QueriesActions = {
  initialize: () => void;
  setQueries: (queries: Record<string, QueryItem>) => void;
  addQuery: (query: QueryItem, select?: boolean) => void;
  removeQuery: (title?: string) => void;
  getQueriesCount: () => number;
  isQuerySelected: (title: string) => boolean;
  clearSelectedQuery: () => void;
  selectQuery: (title: string) => void;
  getQuery: (title: string) => QueryItem;
  getQueries: () => Record<string, QueryItem>;
  getSelectedQuery: () => QueryItem | undefined;
  addExecutedQueries: (queries: QueryLogEntry[]) => void;
  resetExecutedQueries: () => void;
};

const initialState: QueriesState = {
  queriesExecuted: [],
  selectedQueryTitle: undefined,
  queries: {},
};

const baseStore = makeStore<QueriesState>(() => initialState);
const { get, set, setAuto } = baseStore;

export const queriesStoreActions: QueriesActions = {
  initialize: () => {
    setAuto({ ...initialState });
  },
  getQuery: (title) => get().queries[title],
  getQueries: () => {
    const { '': removed, ...rest } = get().queries;
    return rest;
  },
  setQueries: (queries) => {
    setAuto({ queries });
  },
  addQuery: (query, select = true) => {
    set((s) => {
      const next = {
        ...s,
        queries: {
          ...s.queries,
          [query.title]: query,
        },
        ...(select && { selectedQueryTitle: query.title }),
      };
      return next;
    });
  },
  removeQuery: (inputTitle) => {
    const title = inputTitle ?? '';
    set((s) => {
      const { [title]: removed, ...rest } = s.queries;
      return {
        ...s,
        queries: { ...rest },
        ...(s.selectedQueryTitle === title && {
          selectedQueryTitle: undefined,
        }),
      };
    });
  },
  getQueriesCount: () =>
    Object.values(get().queries).filter((q) => q.title !== '').length,
  isQuerySelected: (title) =>
    title.length > 0 && get().selectedQueryTitle === title,
  clearSelectedQuery: () => setAuto({ selectedQueryTitle: undefined }),
  selectQuery: (title: string) => {
    if (get().queries[title]) {
      setAuto({ selectedQueryTitle: title });
    }
  },
  getSelectedQuery: () => {
    const { queries, selectedQueryTitle } = get();

    return selectedQueryTitle !== undefined
      ? queries[selectedQueryTitle]
      : undefined;
  },

  addExecutedQueries: (queries) => {
    const collapsed = collapseSequentialQueryDuplicates(queries);
    setAuto((s) => ({
      ...s,
      queriesExecuted: [...collapsed, ...s.queriesExecuted].slice(0, 500),
    }));
  },
  resetExecutedQueries: () => {
    setAuto({ queriesExecuted: [] });
  },
};

type SelectorArgsType = {
  state: QueriesState;
  api: QueriesActions;
};
export const useQueriesStore = <TSelected = QueriesState>(
  selector?: (args: SelectorArgsType) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = queriesStoreActions;
  return selector ? selector({ state, api }) : ({ state, api } as TSelected);
};
