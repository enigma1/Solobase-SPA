import pickBy from 'lodash-es/pickBy';
import { useQuery } from '@tanstack/react-query';

import {
  UseMutationResult,
  UseMutateFunction,
  UseMutateAsyncFunction,
  MutationOptions,
} from '@tanstack/react-query';

export const STALE_TIME = 5 * 60 * 1000; // 5 minutes

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

export type DataHookProps<TState = any> = {
  state: TState;
  query: ReturnType<typeof useQuery>;
};

export const queryKeys = {
  preferences: () => ['preferences'] as const,
  session: () => ['session'],
  databases: () => ['databases'],
  databaseServerInfo: () => ['database-server-info'],
  tables: (db: string | null) => ['tables', db],
  rows: (db: string | null, table: string | null) => ['table-rows', db, table],
  query: (db: string | null, id: string | null) => ['query', db, id],
};

export const getMutationResult = <TData = any, TVariables = any>(
  mutation: UseMutationResult<TData, any, TVariables>,
) => {
  const api = pickBy(mutation, (val) => typeof val === 'function') as {
    mutate: typeof mutation.mutate;
    mutateAsync: typeof mutation.mutateAsync;
  };

  const query = pickBy(
    mutation,
    (val) => typeof val !== 'function',
  ) as MutationQuery<TData>;
  return { api, query };
};
