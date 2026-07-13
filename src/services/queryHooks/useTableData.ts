import { useQuery } from '@tanstack/react-query';
import {
  dbApi,
  FetchRowsRequest,
  FetchRowsResponse,
  BasicDataRequest,
  BasicDataResponse,
  BasicResponse,
} from '>/services/api';
import { useAccountStore } from '>/services/stores';
import {
  defaultResponse,
  defaultListResponse,
  defaultPageResponse,
} from '>/services/utils';
import { BasicRowsShape, TableBasics } from '>/types';
import { queryKeys, STALE_TIME } from './defs';

type TablesHookProps = {
  state: BasicDataResponse;
  query: ReturnType<typeof useQuery>;
};

export const useTableData = <TSelected = TablesHookProps>(
  request?: BasicDataRequest,
  selector?: (args: TablesHookProps) => TSelected,
) => {
  const initialData: BasicResponse & BasicRowsShape = {
    ...defaultResponse,
    ...defaultListResponse,
    ...defaultPageResponse,
  };

  const { dbSelected, isAuthenticated, activeTable } = useAccountStore(
    ({ state }) => ({
      activeTable: state.activeTable,
      dbSelected: state.dbSelected,
      isAuthenticated: state.isAuthenticated,
    }),
  );

  // React Query fetch
  const q = useQuery<FetchRowsResponse, Error>({
    queryKey: queryKeys.rows(dbSelected, activeTable, request?.paging),
    queryFn: async () => {
      if (!dbSelected || !activeTable) return { ...initialData };
      const data = await dbApi.fetchRows({
        ...request,
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
