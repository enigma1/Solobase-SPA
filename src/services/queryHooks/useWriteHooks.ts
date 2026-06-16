import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PrimeObject } from '>/types';
import { dbApi } from '>/services/api/dbApi';
import { LoginRequest, LoginResponse } from '>/services/api';
import {
  queryKeys,
  MutationCallbacks,
  MutationHookProps,
  getMutationResult,
} from './defs';
import { useAccountStore } from '>/services/stores';
import { defaultResponse } from '>/services/utils';
import { createMutationHook } from './mutationBuilder';

const dbDefaults = {
  ...defaultResponse,
  database: undefined,
};
export const useEditDatabaseMutation = createMutationHook(
  dbApi.editDatabase,
  dbDefaults,
);

export const useSelectDatabaseMutation = createMutationHook(
  dbApi.selectDatabase,
  dbDefaults,
);

export const useCreateDatabaseMutation = createMutationHook(
  dbApi.createDatabase,
  dbDefaults,
);

export const useDeleteDatabasesMutation = createMutationHook(
  dbApi.deleteDatabases,
  {
    ...defaultResponse,
    databases: [],
  },
);

export const useDeleteTablesMutation = createMutationHook(dbApi.deleteTables, {
  ...defaultResponse,
  database: undefined,
  tables: [],
});

const tableDefaults = {
  ...defaultResponse,
  database: undefined,
  table: undefined,
};

export const useCreateTableMutation = createMutationHook(
  dbApi.createTable,
  tableDefaults,
);

export const useEditTableMutation = createMutationHook(
  dbApi.editTable,
  tableDefaults,
);

export const useRawQueryMutation = createMutationHook(dbApi.runRawQuery, {
  ...defaultResponse,
  rows: [],
  database: undefined,
});

export const useLoginMutation = <
  TSelected = ReturnType<typeof createMutationHook>,
>(
  selector?: (
    args: MutationHookProps<LoginResponse, LoginRequest>,
  ) => TSelected,
  callbacks?: MutationCallbacks<LoginResponse, LoginRequest>,
) => {
  const setAuthenticated = useAccountStore(({ api }) => api.setAuthenticated);
  const queryClient = useQueryClient();
  const mutation = createMutationHook(dbApi.login, {
    username: '',
    success: false,
    schemas: [],
  })(selector, {
    // const [data, variables, onMutateResult, context] = args;
    onSuccess: (...args) => {
      setAuthenticated(true);
      queryClient.clear();
      // queryClient.invalidateQueries();
      callbacks?.onSuccess?.(...args);
    },
    onError: (...args) => {
      console.error('Login failed', args[0]);
      callbacks?.onError?.(...args);
    },
  });
  return mutation;
};

// export const useInsertRowsMutation = createMutationHook(dbApi.insertDataRows, {
//   ...tableDefaults,
//   rows: [],
// });

export const useCreateDataRowsMutation = createMutationHook(
  dbApi.createDataRows,
  tableDefaults,
);

export const useDeleteRowsMutation = createMutationHook(dbApi.deleteDataRows, {
  ...tableDefaults,
  rows: [],
});

export const useUpdateRowsMutation = createMutationHook(dbApi.updateDataRows, {
  ...tableDefaults,
  rows: [],
});

type SettingsMutationProps = MutationHookProps<void, PrimeObject>;
export const useSettingsMutation = <TSelected = SettingsMutationProps>(
  selector?: (args: SettingsMutationProps) => TSelected,
  callbacks?: MutationCallbacks<void, PrimeObject>,
) => {
  const preferences = useAccountStore(({ state }) => state.preferences);
  const queryClient = useQueryClient();
  const mutation = createMutationHook(dbApi.saveSettings, undefined)(selector, {
    ...callbacks,

    onError:
      callbacks?.onError ??
      (() => {
        queryClient.setQueryData(queryKeys.preferences(), preferences);
      }),

    onSettled:
      callbacks?.onSettled ??
      (() => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.preferences(),
        });
      }),
  });

  return mutation;
};
