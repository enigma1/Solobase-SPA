import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  dbApi,
  FetchTablesRequest,
  FetchTablesResponse,
  BasicResponse,
} from '>/services/api';
import { useAccountStore } from '>/services/stores';
import {
  defaultResponse,
  defaultListResponse,
  defaultPageResponse,
  getSingleColumnFromResult,
} from '>/services/utils';
import { BasicRowsShape } from '>/types';
import { queryKeys, STALE_TIME, DataHookProps } from './defs';

type TablesHookProps = DataHookProps<FetchTablesResponse>;
export const useTables = <TSelected = TablesHookProps>(
  request?: FetchTablesRequest,
  selector?: (args: TablesHookProps) => TSelected,
) => {
  const initialData: BasicResponse & BasicRowsShape = {
    ...defaultResponse,
    ...defaultListResponse,
    ...defaultPageResponse,
  };

  const { dbSelected, isAuthenticated } = useAccountStore(({ state }) => ({
    dbSelected: state.dbSelected,
    isAuthenticated: state.isAuthenticated,
  }));

  const database = request?.database ?? dbSelected ?? null;

  // React Query data fetch
  const q = useQuery<FetchTablesResponse, Error>({
    queryKey: queryKeys.tables(database, request?.paging),
    queryFn: async () => {
      // const delay = (ms: number) =>
      //   new Promise((resolve) => setTimeout(resolve, ms));
      // await delay(5000);
      if (!database) return { ...initialData };
      const data = await dbApi.fetchTables({ ...request, database });
      return data;
    },
    staleTime: STALE_TIME,
    enabled: !!database && isAuthenticated,
    retry: 1,
    refetchOnWindowFocus: false,
    // placeholderData: keepPreviousData,
  });

  const data = q.data ?? initialData;

  const api = useMemo(() => {
    return {
      getTablesCount: () => data.rows.length,
      getTablesNames: () =>
        getSingleColumnFromResult({
          rows: data.rows,
          columnsOrder: data.columnsOrder,
          field: 'TABLE_NAME',
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
