import { useQuery } from '@tanstack/react-query';
import { dbApi, FetchDatabaseInfoResponse } from '>/services/api';
import { useAccountStore } from '>/services/stores';
import { queryKeys, STALE_TIME } from './defs';
import { FetchDatabasesResponse } from '>/services/api';
import { DataHookProps } from './defs';

export const useSessionRestore = <TSelected = DataHookProps>(
  selector?: (args: DataHookProps) => TSelected,
) => {
  const { restoreSession, isAuthenticated } = useAccountStore(
    ({ api, state }) => ({
      restoreSession: api.restoreSession,
      isAuthenticated: state.isAuthenticated,
    }),
  );

  const initialData = {
    username: '',
    // dbSelected: null,
    // preferences: {},
  };

  const q = useQuery<{ username: string } | null, Error>({
    queryKey: queryKeys.session(),
    queryFn: async (): Promise<{ username: string } | null> => {
      const session = await dbApi.sessionRestore();
      return restoreSession(session); // will return null or { username }
    },
    staleTime: STALE_TIME,
    retry: false,
    enabled: !isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const data = q.data ?? initialData;
  const args = {
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};

type DatabaseHookProps = DataHookProps<FetchDatabasesResponse>;
export const useDatabases = <TSelected = DatabaseHookProps>(
  selector?: (args: DatabaseHookProps) => TSelected,
) => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  const initialData = { databases: [] };
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
  const args = {
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};

type DatabaseServerInfoHookProps = DataHookProps<FetchDatabaseInfoResponse>;
export const useDatabaseServerInfo = <TSelected = DatabaseServerInfoHookProps>(
  selector?: (args: DatabaseServerInfoHookProps) => TSelected,
) => {
  const isAuthenticated = useAccountStore(({ state }) => state.isAuthenticated);
  const initialData = {
    collationsByCharset: {},
    defaults: {
      charset: '',
      collation: '',
    },
  } satisfies FetchDatabaseInfoResponse;
  const q = useQuery<FetchDatabaseInfoResponse, Error>({
    queryKey: queryKeys.databaseServerInfo(),
    // select: (data) => data.databases, // transform to string[] for easier usage
    queryFn: async () => {
      console.log('Fetching database server info...');
      const data = await dbApi.fetchDatabaseInfo();
      console.log('Fetched database server info:', data);
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
    state: data,
    query: q,
  };
  return selector ? selector(args) : (args as TSelected);
};
