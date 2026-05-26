import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PrimeObject } from '>/types';
import { dbApi } from '>/services/api/dbApi';
import {
  CreateDatabaseRequest,
  CreateDatabaseResponse,
  LoginRequest,
  LoginResponse,
  UpdateRowsRequest,
  UpdateRowsResponse,
} from '>/services/api';
import {
  queryKeys,
  MutationCallbacks,
  MutationHookProps,
  getMutationResult,
} from './defs';
import { useAccountStore } from '>/services/stores';
import { createMutationHook } from './mutationBuilder';

export const useSelectDatabaseMutation = createMutationHook(
  dbApi.selectDatabase,
  {
    database: undefined,
    success: false,
    message: '',
  },
);

export const useCreateDatabaseMutation = createMutationHook(
  dbApi.createDatabase,
  {
    database: undefined,
    success: false,
    message: '',
  },
);

export const useDeleteDatabasesMutation = createMutationHook(
  dbApi.deleteDatabases,
  {
    databases: [],
    success: false,
    message: '',
  },
);

export const useDeleteTablesMutation = createMutationHook(dbApi.deleteTables, {
  tables: [],
  success: false,
  message: '',
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

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const initializeStore = useAccountStore(({ api }) => api.initialize);

  return useMutation({
    mutationFn: () => dbApi.logout(),

    onSuccess: () => {
      // 1. Remove session query cache
      queryClient.removeQueries({ queryKey: queryKeys.session() });

      // 2. Reset your store
      initializeStore();
    },

    onError: (error) => {
      console.error('Logout failed', error);
    },
  });
};

// type UpdateRowsProps = {
//   resetEditedRows?: () => void;
// };
// export const useUpdateRowsMutation = (props: UpdateRowsProps) => {
//   const { resetEditedRows } = props;
//   const queryClient = useQueryClient();
//   const addMessage = useMessageStore(({ api }) => api.addMessage);
//   const dbSelected = useAccountStore(({ state }) => state.dbSelected);
//   const { activeTable } = useTablesDataStore(({ state }) => ({
//     activeTable: state.activeTable,
//   }));

//   return useMutation({
//     mutationFn: (data: UpdateRowsRequest) => dbApi.updateRows(data),

//     onSuccess: () => {
//       // Remove rows from query cache
//       queryClient.removeQueries({
//         queryKey: queryKeys.rows(dbSelected, activeTable),
//       });
//       // reset local edited state if provided
//       resetEditedRows?.();
//       addMessage({
//         type: 'success',
//         content: { text: `Rows saved successfully`, duration: 3000 },
//       });
//     },

//     onError: (error) => {
//       console.error('Update rows failed', error);
//       addMessage({
//         content: { text: `Failed to save changes`, duration: 3000 },
//       });
//     },
//   });
// };

export const useUpdateRowsMutation = createMutationHook(dbApi.updateRows, {
  rows: [],
});

// export const useUpdateRowsMutation2 = <
//   TSelected = MutationHookProps<UpdateRowsResponse>,
// >(
//   selector?: (args: MutationHookProps<UpdateRowsResponse>) => TSelected,
//   callbacks?: MutationCallbacks<UpdateRowsResponse, UpdateRowsRequest>,
// ) => {
//   const { onSuccess, onError } = callbacks || {};

//   const mutation = useMutation({
//     mutationFn: (data: UpdateRowsRequest) => dbApi.updateRows(data),
//     onSuccess,
//     onError,
//   });

//   const state = mutation.data ?? { rows: [] };
//   const args = {
//     ...getMutationResult<UpdateRowsResponse, UpdateRowsRequest>(mutation),
//     state,
//   };
//   return selector ? selector(args) : (args as TSelected);
// };

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
