import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  dbApi,
  FetchTablesResponse,
  BasicResponse,
  BasicDataRequest,
} from '>/services/api';
import { useAccountStore } from '>/services/stores';
import {
  defaultResponse,
  defaultListResponse,
  defaultPageResponse,
  getSingleColumnFromResult,
  databaseFields,
} from '>/services/utils';
import { BasicRowsShape, TableBasicsUndefined } from '>/types';
import {
  queryKeys,
  STALE_TIME,
  DataQueryHookProps,
  DataQueryHookOptions,
} from './defs';

type TablesHookProps = DataQueryHookProps<FetchTablesResponse>;
export const useTables = <TSelected = TablesHookProps>(
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
    !!request.database && isAuthenticated && (options?.enabled ?? true);

  // React Query data fetch
  const q = useQuery<FetchTablesResponse, Error>({
    queryKey: queryKeys.tables(request?.database ?? '', request),
    queryFn: async () => {
      // const delay = (ms: number) =>
      //   new Promise((resolve) => setTimeout(resolve, ms));
      // await delay(5000);
      const data = await dbApi.fetchTables({
        ...request,
        database: request.database!,
      });
      return data;
    },
    staleTime: STALE_TIME,
    enabled,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const data = q.data ?? initialData;

  const api = useMemo(() => {
    return {
      getTablesCount: () => data.rows.length,
      getTablesNames: () =>
        getSingleColumnFromResult({
          rows: data.rows,
          columnsOrder: data.columnsOrder,
          field: databaseFields.table,
        }),
    };
  }, [data.rows, data.columnsOrder]);

  // return selector pattern
  const store = {
    state: data,
    api, // api object (always valid)
    query: q,
  };
  return selector ? selector(store) : (store as TSelected);
};
