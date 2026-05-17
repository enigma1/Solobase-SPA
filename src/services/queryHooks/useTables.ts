import { useQuery } from '@tanstack/react-query';
import { dbApi, FetchTablesResponse } from '>/services/api';
import { useAccountStore } from '>/services/stores';
import { DbTable } from '>/types';
import { queryKeys, STALE_TIME } from './defs';

type TablesHookState = {
  tables: Record<string, DbTable>;
};
type TablesHookApi = {
  getTablesCount: () => number;
};

type TablesHookProps = {
  state: TablesHookState;
  api: TablesHookApi;
  query: ReturnType<typeof useQuery>;
};

export const useTablesHook = <TSelected = TablesHookProps>(
  selector?: (args: TablesHookProps) => TSelected,
) => {
  const initialData = {
    tables: {},
  } satisfies TablesHookState;

  const { dbSelected, isAuthenticated } = useAccountStore(({ state }) => ({
    dbSelected: state.dbSelected,
    isAuthenticated: state.isAuthenticated,
  }));

  const database = dbSelected ?? null;

  // React Query data fetch
  const q = useQuery<FetchTablesResponse, Error>({
    queryKey: queryKeys.tables(database),
    queryFn: async () => {
      if (!database) return { ...initialData };
      const data = await dbApi.fetchTables({ database });
      return data;
    },
    staleTime: STALE_TIME,
    enabled: !!database && isAuthenticated,
    retry: 1,
    refetchOnWindowFocus: false,
    initialData,
  });

  // state object
  const state: TablesHookState = {
    tables: q.data?.tables ?? initialData.tables,
  };

  // api object (always valid)
  const api = {
    getTablesCount: () => Object.keys(state.tables).length,
  };

  const store = {
    state,
    api,
    query: q,
  };
  return selector ? selector(store) : (store as TSelected);
};
