import { useQuery } from '@tanstack/react-query';
import { dbApi, FetchRowsResponse, BasicDataResponse } from '>/services/api';
import { useAccountStore } from '>/services/stores';
import { defaultResponse } from '>/services/utils';
import { queryKeys, STALE_TIME } from './defs';

type TablesHookProps = {
  state: BasicDataResponse;
  query: ReturnType<typeof useQuery>;
};

const defaultCollectionColumns = {};

export const useTableDataHook = <TSelected = TablesHookProps>(
  selector?: (args: TablesHookProps) => TSelected,
) => {
  const initialData = {
    ...defaultResponse,
    rows: [],
    cols: defaultCollectionColumns,
    columnsOrder: [],
    rowTokens: undefined,
  } satisfies BasicDataResponse;

  const { dbSelected, isAuthenticated, activeTable } = useAccountStore(
    ({ state }) => ({
      activeTable: state.activeTable,
      dbSelected: state.dbSelected,
      isAuthenticated: state.isAuthenticated,
    }),
  );

  // React Query fetch
  const q = useQuery<FetchRowsResponse, Error>({
    queryKey: queryKeys.rows(dbSelected, activeTable),
    queryFn: async () => {
      if (!dbSelected || !activeTable) return { ...initialData };
      const data = await dbApi.fetchRows({
        database: dbSelected,
        table: activeTable,
      });
      return data;
    },
    staleTime: STALE_TIME,
    enabled: !!dbSelected && !!activeTable && isAuthenticated,
    retry: 1,
    refetchOnWindowFocus: false,
    // initialData,
  });

  const data = q.data ?? initialData;
  const args = {
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};
