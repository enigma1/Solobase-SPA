import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FetchDatabasesResponseSchema } from '>/contracts';
import { useAccountStore } from '>/services/stores';
import {
  queryKeys,
  STALE_TIME,
  DataQueryHookProps,
  HookStore,
  DataQueryHookOptions,
} from './defs';
import {
  dbApi,
  FetchDatabasesResponse,
  SessionRestoreResponse,
  GetTableDetailsResponse,
  GetTableColumnsInfoResponse,
  FetchUsersRequest,
  FetchUsersResponse,
  FetchDatabaseInfoResponse,
  LoadPreferencesResponse,
  BasicDataRequest,
} from '>/services/api';
import {
  databaseFields,
  getSingleColumnFromResult,
  defaultResponse,
  defaultListResponse,
  defaultPageRequest,
  defaultPageResponse,
} from '>/services/utils';
import { TableBasicsUndefined, BasicRowsShape, StorageConfig } from '>/types';
// import { createDataQueryHook } from './dataQueryBuilder';

const loadPreferencesInitialData: LoadPreferencesResponse = {
  ...defaultResponse,
  userPrefs: {
    ...((window as any).APP_CONFIG.userPrefs as StorageConfig),
    queries: {},
    copiedRows: {},
  },
};

type PreferencesHookProps = DataQueryHookProps<LoadPreferencesResponse>;
export const useLoadPreferences = <TSelected = PreferencesHookProps>(
  selector?: (args: PreferencesHookProps) => TSelected,
) => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  const q = useQuery<LoadPreferencesResponse, Error>({
    queryKey: queryKeys.preferences(),
    queryFn: async (): Promise<LoadPreferencesResponse> => {
      const result = await dbApi.loadPreferences({});
      return result?.ok ? result : loadPreferencesInitialData;
    },
    staleTime: STALE_TIME,
    retry: 1,
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const data = q.data ?? loadPreferencesInitialData;

  const args = {
    api: {},
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};

const sessionRestoreInitialData: SessionRestoreResponse = {
  ...defaultResponse,
  username: '',
  dbSelected: null,
  capabilities: [],
  preferences: {},
};

type RestoreHookProps = DataQueryHookProps<SessionRestoreResponse>;
export const useSessionRestore = <TSelected = RestoreHookProps>(
  selector?: (args: RestoreHookProps) => TSelected,
) => {
  const { restoreSession, isAuthenticated } = useAccountStore(
    ({ api, state }) => ({
      restoreSession: api.restoreSession,
      isAuthenticated: state.isAuthenticated,
    }),
  );

  const canRestore = sessionStorage.getItem('can-restore');
  const q = useQuery<SessionRestoreResponse, Error>({
    queryKey: queryKeys.session(),
    queryFn: async (): Promise<SessionRestoreResponse> => {
      const session = await dbApi.sessionRestore();
      const result = restoreSession(session);
      return result ? session : sessionRestoreInitialData;
    },
    staleTime: STALE_TIME,
    retry: false,
    enabled: !isAuthenticated && canRestore === 'true',
    refetchOnWindowFocus: false,
  });

  const data = q.data ?? sessionRestoreInitialData;

  const args = {
    api: {},
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};

// export const useDatabases2 = createDataQueryHook({
//   queryKey: queryKeys.databases,
//   queryFn: dbApi.fetchDatabases,
//   initialData,
//   createApi: (data) => ({
//     getDbNames: () =>
//       getSingleColumnFromResult(data.rows, data.columnsOrder, databaseFields.name),
//   }),
// });

const fetchDatabasesInitialData: FetchDatabasesResponse = {
  ...defaultResponse,
  ...defaultListResponse,
  ...defaultPageResponse,
};

type DatabaseHookProps = DataQueryHookProps<FetchDatabasesResponse>;
export const useDatabases = <TSelected = DatabaseHookProps>(
  request: BasicDataRequest,
  selector?: (args: DatabaseHookProps) => TSelected,
  options?: DataQueryHookOptions,
) => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  const enabled = isAuthenticated && (options?.enabled ?? true);

  const q = useQuery<FetchDatabasesResponse, Error>({
    queryKey: queryKeys.databases(request),
    // select: (data) => data.databases, // transform to string[] for easier usage
    queryFn: async () => {
      const response = await dbApi.fetchDatabases(
        request ?? defaultPageRequest,
      );
      FetchDatabasesResponseSchema.parse(response);
      return response;
    },
    staleTime: STALE_TIME,
    enabled,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const data = q.data ?? fetchDatabasesInitialData;

  const api = useMemo(() => {
    return {
      getDbNames: (): string[] =>
        getSingleColumnFromResult({
          rows: data.rows,
          columnsOrder: data.columnsOrder,
          field: databaseFields.name,
        }),
    };
  }, [data.rows, data.columnsOrder]);

  const args = {
    api,
    state: data,
    query: q,
  } satisfies DataQueryHookProps<FetchDatabasesResponse, typeof api>;

  return selector ? selector(args) : (args as TSelected);
};

type DatabaseServerInfoHookProps =
  DataQueryHookProps<FetchDatabaseInfoResponse>;
export const useDatabaseServerInfo = <TSelected = DatabaseServerInfoHookProps>(
  selector?: (args: DatabaseServerInfoHookProps) => TSelected,
) => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  const initialData = {
    ...defaultResponse,
    collationsByCharset: {},
    engines: [],
    defaults: {
      charset: '',
      collation: '',
      engine: '',
    },
  } satisfies FetchDatabaseInfoResponse;
  const q = useQuery<FetchDatabaseInfoResponse, Error>({
    queryKey: queryKeys.databaseServerInfo(),
    // select: (data) => data.databases, // transform to string[] for easier usage
    queryFn: async () => {
      const data = await dbApi.fetchDatabaseInfo();
      return data;
    },
    staleTime: STALE_TIME,
    enabled: isAuthenticated,
    retry: 1,
    refetchOnWindowFocus: false,
    // placeholderData: keepPreviousData,
    // initialData,
  });

  const data = q.data ?? initialData;
  const args = {
    api: {},
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};

type TableDetailsHookProps = DataQueryHookProps<GetTableDetailsResponse>;
export const useTableDetailsHook = <TSelected = TableDetailsHookProps>(
  request: { database: string; table: string },
  selector?: (args: TableDetailsHookProps) => TSelected,
) => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);

  const initialData = {
    ...defaultResponse,
    database: request.database,
    table: request.table,
    charset: '',
    collation: '',
    engine: '',
    cols: [],
    keys: [],
  } satisfies GetTableDetailsResponse;

  const q = useQuery<GetTableDetailsResponse, Error>({
    queryKey: queryKeys.tableDetails(request.database, request.table),
    // select: (data) => data.databases, // transform to string[] for easier usage
    queryFn: async () => {
      const data = await dbApi.getTableDetails(request);
      return data;
    },
    enabled: isAuthenticated && !!request.database && !!request.table,
    staleTime: STALE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const data = q.data ?? initialData;
  const args = {
    api: {} as {},
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};

type TableColumnsInfoHookProps =
  DataQueryHookProps<GetTableColumnsInfoResponse>;
export const useTableColumnsInfoHook = <TSelected = TableColumnsInfoHookProps>(
  request: TableBasicsUndefined,
  selector?: (args: TableColumnsInfoHookProps) => TSelected,
  options?: DataQueryHookOptions,
) => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);

  const enabled =
    !!request.database &&
    !!request.table &&
    isAuthenticated &&
    (options?.enabled ?? true);

  const initialData: GetTableColumnsInfoResponse = {
    ...defaultResponse,
    ...defaultListResponse,
    database: request.database ?? '',
    table: request.table ?? '',
  };

  const q = useQuery<GetTableColumnsInfoResponse, Error>({
    queryKey: queryKeys.tableColumnsInfo(
      request.database ?? '',
      request.table ?? '',
    ),
    queryFn: async () => {
      const data = await dbApi.getTableColumnsInfo({
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
    api: {} as {},
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};

type UsersHookProps = DataQueryHookProps<FetchUsersResponse>;
export const useUsers = <TSelected = UsersHookProps>(
  request: BasicDataRequest,
  selector?: (args: UsersHookProps) => TSelected,
  options?: DataQueryHookOptions,
) => {
  const initialData = {
    ...defaultResponse,
    ...defaultListResponse,
  } satisfies BasicRowsShape;

  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  const enabled = isAuthenticated && (options?.enabled ?? true);

  const q = useQuery<FetchDatabasesResponse, Error>({
    queryKey: queryKeys.users(request),
    queryFn: async () => {
      const data = await dbApi.fetchUsers({ ...request });
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
      getNames: (): string[] =>
        getSingleColumnFromResult({
          rows: data.rows,
          columnsOrder: data.columnsOrder,
          field: databaseFields.name,
        }),
    };
  }, [data.rows, data.columnsOrder]);

  const args = {
    api,
    state: data,
    query: q,
  } satisfies DataQueryHookProps<FetchDatabasesResponse, typeof api>;

  return selector ? selector(args) : (args as TSelected);
};
