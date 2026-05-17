import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { dbApi, RunQueryResponse } from '>/services/api';
import { useAccountStore, useHistoryStore } from '>/services/stores';
import { SqlColumnsShape, SqlRow } from '>/types';
import { queryKeys } from './defs';

export const useQueryDataMutation = () => {
  const queryClient = useQueryClient();
  const { addQuery, updateModified, removeQuery } = useHistoryStore(
    ({ api }) => ({
      updateModified: api.updateModified,
      removeQuery: api.removeQuery,
      addQuery: api.addQuery,
    }),
  );

  return useMutation({
    mutationFn: async ({
      query,
      database,
    }: {
      query: string;
      database: string;
    }) => {
      return dbApi.runQuery({ query, database });
    },

    // onSuccess: (data, variables) => {
    //   const { database, query } = variables;
    //   const newId = addQuery({
    //     modified: data.query, // server returned query actually executed
    //     query, // original user typed query,
    //     database,
    //   });

    //   // store in cache so useQueryDataHook can have it in the cache
    //   queryClient.setQueryData(queryKeys.query(database, newId), data);
    // },
    // onError: (error, variables) => {
    //   const { id } = variables;
    //   removeQuery(id);
    // },
  });
};

type QueryDataHookState = {
  cols: SqlColumnsShape;
  rows: SqlRow[];
  truncated: boolean;
  query: string;
  columnsOrder: string[];
};

type TablesHookProps = {
  state: QueryDataHookState;
  query: ReturnType<typeof useQuery>;
};

export const useQueryDataHook = <TSelected = TablesHookProps>(
  selector?: (args: TablesHookProps) => TSelected,
) => {
  const initialData = {
    rows: [],
    cols: {},
    query: '',
    truncated: false,
    columnsOrder: [],
  } satisfies QueryDataHookState;

  // const dbSelected = useAccountStore(({ state }) => state.dbSelected);
  // const database = dbSelected ?? null;
  const { querySelection } = useHistoryStore(({ api }) => ({
    querySelection: api.getQuery() ?? null,
  }));
  const database = querySelection?.database ?? null;
  const id = querySelection?.id ?? null;

  // React Query fetch
  const q = useQuery<RunQueryResponse, Error>({
    queryKey: queryKeys.query(database, id),
    queryFn: () => initialData,
    staleTime: 5 * 60 * 1000,
    enabled: false,
    initialData,
  });

  return selector
    ? selector({ state: q.data ?? initialData, query: q })
    : ({ state: q.data ?? initialData, query: q } as TSelected);
};
