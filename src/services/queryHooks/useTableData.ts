import { useQuery } from '@tanstack/react-query';
import { dbApi, FetchRowsResponse, BasicResponse } from '>/services/api';
import { useAccountStore, useTablesDataStore } from '>/services/stores';
import { defaultResponse } from '>/services/utils';
import { CollectionColumns, TableData } from '>/types';
import { queryKeys, STALE_TIME } from './defs';

type TableDataHookState = TableData & BasicResponse;
type TablesHookProps = {
  state: TableDataHookState;
  query: ReturnType<typeof useQuery>;
};

const defaultCollectionColumns = {
  _id: 'string',
  doc: {},
} satisfies CollectionColumns;

export const useTableDataHook = <TSelected = TablesHookProps>(
  selector?: (args: TablesHookProps) => TSelected,
) => {
  const initialData = {
    ...defaultResponse,
    rows: [],
    cols: defaultCollectionColumns,
    type: 'collection',
    columnsOrder: [],
  } satisfies TableDataHookState;

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
      const data = await dbApi.fetchRows({ table: activeTable });
      return data;
    },
    staleTime: STALE_TIME,
    enabled: !!dbSelected && !!activeTable && isAuthenticated,
    retry: 1,
    refetchOnWindowFocus: false,
    initialData,
  });

  const data = q.data ?? initialData;
  const args = {
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};
