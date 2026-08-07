import { useQuery } from '@tanstack/react-query';
import {
  dbApi,
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
import { BasicRowsShape, TableBasicsUndefined } from '>/types';
import { queryKeys, STALE_TIME, DataQueryHookOptions } from './defs';

type TablesHookProps = {
  state: BasicDataResponse;
  query: ReturnType<typeof useQuery>;
};

export const useTableData = <TSelected = TablesHookProps>(
  request: TableBasicsUndefined & BasicDataRequest,
  selector?: (args: TablesHookProps) => TSelected,
  options?: DataQueryHookOptions,
) => {
  const initialData: BasicResponse & BasicRowsShape = {
    ...defaultResponse,
    ...defaultListResponse,
    ...defaultPageResponse,
  };

  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);

  const enabled =
    !!request.database &&
    !!request.table &&
    isAuthenticated &&
    (options?.enabled ?? true);

  // React Query fetch
  const q = useQuery<FetchRowsResponse, Error>({
    queryKey: queryKeys.rows(
      request.database ?? '',
      request.table ?? '',
      request,
    ),
    queryFn: async () => {
      const data = await dbApi.fetchRows({
        ...request,
        database: request.database!,
        table: request.table!,
      });
      return data;
    },
    staleTime: STALE_TIME,
    enabled,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const data = q.data ?? initialData;
  const args = {
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};
