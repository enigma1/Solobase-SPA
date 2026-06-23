import { makeStore } from '>/services/utils/emitter';
import { GroupByModes } from '>/types';
type Query = {
  title: string;
  query: string;
  database?: string;
  groupByMode?: GroupByModes;
};

type QueriesState = {
  selectedQueryTitle?: string;
  queries: Record<string, Query>;
};
// columnsOrder: string[];
// rows: unknown[];
// type?: 'command' | 'resultset';

export type QueriesActions = {
  initialize: () => void;
  addQuery: (query: Query, select?: boolean) => void;
  removeQuery: (title: string) => void;
  getQueriesCount: () => number;
  isQuerySelected: (title: string) => boolean;
  clearSelectedQuery: () => void;
  selectQuery: (title: string) => void;
  getQuery: (title: string) => Query;
  getQueries: () => Record<string, Query>;
  getSelectedQuery: () => Query | undefined;
};

const initialState: QueriesState = {
  selectedQueryTitle: undefined,
  queries: {
    'Query-1': {
      title: 'Query-1',
      query: 'select * from customers',
      database: 'testing',
    },
    'Query-2': {
      title: 'Query-2',
      query: 'select * from orders',
      database: 'testing',
    },
    'Query-3': {
      title: 'Query-3',
      query: 'select * from products_description',
      database: 'oscommerce',
    },
    'Query-4': {
      title: 'Query-4',
      query:
        'select distinct pd.* from products_description pd left join products_to_categories p2c using (products_id)',
      database: 'oscommerce',
    },
    'Query-5': {
      title: 'Query-5',
      query: `select pd.*, p2c.* from products_description pd left join products_to_categories p2c using (products_id) group by p2c.products_id`,
      database: 'oscommerce',
      groupByMode: 'legacy',
    },
    'Query-6': {
      title: 'Query-6',
      query: `SELECT *
FROM (
  SELECT
    pd.products_id,
    pd.products_name,
    pd.language_id,

    p2c.products_id AS p2c_products_id,
    p2c.categories_id,

    ROW_NUMBER() OVER (
      PARTITION BY p2c.products_id
      ORDER BY p2c.products_id
    ) AS rn
  FROM products_description pd
  LEFT JOIN products_to_categories p2c
    ON pd.products_id = p2c.products_id
) x
WHERE rn = 1`,
      database: 'oscommerce',
    },
    'Query-7': {
      title: 'Query-7',
      query: 'ANALYZE TABLE products_description',
      groupByMode: 'legacy',
    },
    Privileges: {
      title: 'Privileges',
      query: 'SHOW GRANTS FOR CURRENT_USER()',
      // groupByMode: 'legacy',
    },
  },
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
  addQuery: (query, select = true) => {
    set((s) => {
      const next = {
        queries: {
          ...s.queries,
          [query.title]: query,
        },
        ...(select && { selectedQueryTitle: query.title }),
      };
      return next;
    });
  },
  removeQuery: (title) => {
    set((s) => {
      const { [title]: removed, ...rest } = s.queries;
      return {
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
