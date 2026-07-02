import { useRef, useMemo, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { dbApi, FetchTablesResponse, BasicResponse } from '>/services/api';
import { useAccountStore } from '>/services/stores';
import { defaultResponse, getSingleColumnFromResult } from '>/services/utils';
import { SqlTableData } from '>/types';
import { queryKeys, STALE_TIME, DataHookProps } from './defs';

type TablesHookProps = DataHookProps<FetchTablesResponse>;
export const useTablesHook = <TSelected = TablesHookProps>(
  selector?: (args: TablesHookProps) => TSelected,
) => {
  const initialData: BasicResponse & SqlTableData = {
    ...defaultResponse,
    rows: [],
    cols: {},
    columnsOrder: [],
  };

  const { dbSelected, isAuthenticated } = useAccountStore(({ state }) => ({
    dbSelected: state.dbSelected,
    isAuthenticated: state.isAuthenticated,
  }));

  const database = dbSelected ?? null;

  // React Query data fetch
  const q = useQuery<FetchTablesResponse, Error>({
    queryKey: queryKeys.tables(database),
    queryFn: async () => {
      // const delay = (ms: number) =>
      //   new Promise((resolve) => setTimeout(resolve, ms));
      // await delay(5000);
      if (!database) return { ...initialData };
      const data = await dbApi.fetchTables({ database });
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

  // state object
  // const api = useMemo(() => {
  //   return {
  //     getTablesCount: () => data.rows.length,
  //     getTablesNames: () => {
  //       const nameIndex = data.columnsOrder.indexOf('TABLE_NAME');
  //       if (nameIndex === -1) return [];
  //       const result = data.rows.map((row) => row[nameIndex]);
  //       return result;
  //     },
  //   };
  // }, [data.rows, data.columnsOrder]);

  // return selector pattern
  const store = {
    state: data,
    api, // api object (always valid)
    query: q,
  };
  return selector ? selector(store) : (store as TSelected);
};
