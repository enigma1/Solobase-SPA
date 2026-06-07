import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dbApi, FetchDatabaseInfoResponse } from '>/services/api';
import { useAccountStore } from '>/services/stores';
import { queryKeys, STALE_TIME } from './defs';
import {
  FetchDatabasesResponse,
  SessionRestoreResponse,
  BasicRowsShape,
} from '>/services/api';
import { getSingleColumnFromResult } from '>/services/utils';
import { DataHookProps, HookStore } from './defs';
import { DbQueryData } from '>/types';

type RestoreHookProps = DataHookProps<SessionRestoreResponse>;
export const useSessionRestore = <TSelected = RestoreHookProps>(
  selector?: (args: RestoreHookProps) => TSelected,
) => {
  const { restoreSession, isAuthenticated } = useAccountStore(
    ({ api, state }) => ({
      restoreSession: api.restoreSession,
      isAuthenticated: state.isAuthenticated,
    }),
  );

  const initialData: SessionRestoreResponse = {
    username: '',
    schemas: {
      rows: [],
      cols: {},
      columnsOrder: [],
    },
    dbSelected: null,
    preferences: {},
  };
  const canRestore = sessionStorage.getItem('can-restore');
  const q = useQuery<SessionRestoreResponse, Error>({
    queryKey: queryKeys.session(),
    queryFn: async (): Promise<SessionRestoreResponse> => {
      const session = await dbApi.sessionRestore();
      const result = restoreSession(session);
      return result ? session : initialData;
    },
    staleTime: STALE_TIME,
    retry: false,
    enabled: !isAuthenticated && canRestore === 'true',
    refetchOnWindowFocus: false,
  });

  const data = q.data ?? initialData;

  const api = useMemo(() => {
    // const nameIndex = data.schemas.columnsOrder.indexOf('SCHEMA_NAME');

    // return {
    //   getDbNames: () => {
    //     if (nameIndex === -1) return [];
    //     return data.schemas.rows.map((row) => row[nameIndex]);
    //   },
    // };
    return {
      getDbNames: () =>
        getSingleColumnFromResult(
          data.schemas.rows,
          data.schemas.columnsOrder,
          'SCHEMA_NAME',
        ),
    };
  }, [data.schemas.rows, data.schemas.columnsOrder]);

  const args = {
    api,
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};

type DatabaseHookProps = DataHookProps<FetchDatabasesResponse>;
export const useDatabases = <TSelected = DatabaseHookProps>(
  selector?: (args: DatabaseHookProps) => TSelected,
) => {
  const initialData = {
    rows: [],
    cols: {},
    columnsOrder: [],
  } satisfies DbQueryData;

  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  // const q = useQuery<FetchDatabasesResponse, Error, string[]>({
  const q = useQuery<FetchDatabasesResponse, Error>({
    queryKey: queryKeys.databases(),
    // select: (data) => data.databases, // transform to string[] for easier usage
    queryFn: async () => {
      const data = await dbApi.fetchDatabases();
      return data;
    },
    staleTime: STALE_TIME,
    enabled: isAuthenticated,
    retry: 1,
    refetchOnWindowFocus: false,
    // placeholderData: keepPreviousData,
    initialData,
  });
  const data = q.data ?? initialData;

  const api = useMemo(() => {
    return {
      getDbNames: () =>
        getSingleColumnFromResult(data.rows, data.columnsOrder, 'SCHEMA_NAME'),
    };
  }, [data.rows, data.columnsOrder]);

  const args = {
    api,
    state: data,
    query: q,
  } satisfies DataHookProps<FetchDatabasesResponse, typeof api>;

  return selector ? selector(args) : (args as TSelected);
};

type DatabaseServerInfoHookProps = DataHookProps<FetchDatabaseInfoResponse>;
export const useDatabaseServerInfo = <TSelected = DatabaseServerInfoHookProps>(
  selector?: (args: DatabaseServerInfoHookProps) => TSelected,
) => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  const initialData = {
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
    initialData,
  });

  const data = q.data ?? initialData;
  const args = {
    api: {} as {},
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};
