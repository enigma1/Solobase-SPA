import pickBy from 'lodash-es/pickBy';
import {
  useQuery,
  UseMutationResult,
  UseMutateFunction,
  UseMutateAsyncFunction,
  MutationOptions,
} from '@tanstack/react-query';
import { accountStoreActions } from '>/services/stores';
import { createNetworkError } from '>/services/api/apiErrors';

export const STALE_TIME = 5 * 60 * 1000; // Set default to 5 minutes

export type QueryHookOptions<TData, TVariables, TApi extends object = {}> = {
  queryKey: (variables: TVariables) => string[];
  queryFn: (variables: TVariables) => Promise<TData>;
  initialData: TData;
  enabled?: (variables: TVariables) => boolean;
  createApi?: (data: TData) => TApi;
};

export type MutationApi<TData = any, TVariables = any> = {
  mutate: UseMutateFunction<TData, unknown, TVariables>;
  mutateAsync: UseMutateAsyncFunction<TData, unknown, TVariables>;
};

export type MutationQuery<TData = any> = Omit<
  UseMutationResult<TData, unknown, any>,
  'mutate' | 'mutateAsync'
>;

export type MutationHookProps<TData, TVariables> = {
  api: MutationApi<TData, TVariables>;
  query: MutationQuery<TData>;
  state: TData;
};

export type MutationCallbacks<
  TData,
  TVariables,
  TError = unknown,
  TContext = unknown,
> = Partial<MutationOptions<TData, TError, TVariables, TContext>>;

export type DataHookProps<
  TState,
  TApi = Record<string, (...args: any[]) => any>,
> = {
  api: TApi;
  state: TState;
  query: ReturnType<typeof useQuery>;
};

export type HookStore<TState = unknown, TApi = unknown, TQuery = unknown> = {
  state: TState;
  api: TApi;
  query: TQuery;
};
export type HookSelector<TStore, TResult = TStore> = (store: TStore) => TResult;

const invalidationPipeline = [
  'databases',
  'tables',
  'table-details',
  'columns-info',
  'table-rows',
] as const;

type InvalidationKey = (typeof invalidationPipeline)[number];

export const queryKeys = {
  preferences: () => ['preferences'] as const,
  session: () => ['session'],
  users: () => ['users'],
  databaseServerInfo: () => ['database-server-info'],
  query: (db: string | null, id: string | null) => ['query', db, id],

  // Hierarchical keys
  databases: () => [...getInvalidationLegacy('databases')] as const,
  tables: (db: string | null) =>
    [...getInvalidationLegacy('tables'), db] as const,
  tableDetails: (db: string | null, table: string | null) =>
    [...getInvalidationLegacy('table-details'), db, table] as const,
  tableColumnsInfo: (db: string | null, table: string | null) =>
    [...getInvalidationLegacy('columns-info'), db, table] as const,
  rows: (db: string | null, table: string | null) =>
    [...getInvalidationLegacy('table-rows'), db, table] as const,
};

export const getInvalidationLegacy = (key: InvalidationKey) => {
  const index = invalidationPipeline.indexOf(key);
  if (index === -1) {
    throw new Error(`Invalidation key not found in hierarchy: ${key}`);
  }

  return invalidationPipeline.slice(0, index + 1);
};

export const getMutationResult = <TData = any, TVariables = any>(
  mutation: UseMutationResult<TData, any, TVariables>,
) => {
  const guardMutate: typeof mutation.mutate = (variables, options) => {
    if (!accountStoreActions.getAppStatus()) {
      // const error = createNetworkError('offline');
      // options?.onError?.(error, variables, undefined, mutation.context);
      console.log('Mutation attempt while offline = exiting');
      return;
    }

    mutation.mutate(variables, options);
  };

  const guardMutateAsync: typeof mutation.mutateAsync = async (
    variables,
    options,
  ) => {
    if (!accountStoreActions.getAppStatus()) {
      throw createNetworkError('offline');
    }

    return mutation.mutateAsync(variables, options);
  };

  const api = pickBy(mutation, (val) => typeof val === 'function') as {
    mutate: typeof mutation.mutate;
    mutateAsync: typeof mutation.mutateAsync;
  };

  const query = pickBy(
    mutation,
    (val) => typeof val !== 'function',
  ) as MutationQuery<TData>;
  return {
    api: {
      ...api,
      mutate: guardMutate,
      mutateAsync: guardMutateAsync,
    },
    query,
  };
};
