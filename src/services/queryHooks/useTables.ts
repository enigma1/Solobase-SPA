import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dbApi, FetchTablesResponse, BasicResponse } from '>/services/api';
import { useAccountStore } from '>/services/stores';
import { defaultResponse } from '>/services/utils';
import { BaseTableData } from '>/types';
import { queryKeys, STALE_TIME, DataHookProps } from './defs';

type TablesHookProps = DataHookProps<FetchTablesResponse>;
export const useTablesHook = <TSelected = TablesHookProps>(
  selector?: (args: TablesHookProps) => TSelected,
) => {
  const initialData = {
    ...defaultResponse,
    rows: [],
    cols: {},
    columnsOrder: [],
  } satisfies BaseTableData & BasicResponse;

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

  const data = q.data ?? initialData;
  // state object
  const api = useMemo(() => {
    const nameIndex = data.columnsOrder.indexOf('TABLE_NAME');

    return {
      getTablesCount: () => data.rows.length,
      getTablesNames: () => {
        if (nameIndex === -1) return [];
        const result = data.rows.map((row) => row[nameIndex]);
        return result;
      },
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
