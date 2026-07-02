import type { MutationFunction } from '@tanstack/react-query';
import { dbApi } from '>/services/api/dbApi';
import type {
  LoginRequest,
  LoginResponse,
  RunRawQueryResponse,
  RunRawQueryRequest,
  EditTableRequest,
  EditTableResponse,
  CreateTableRequest,
  CreateTableResponse,
  DeleteTablesRequest,
  DeleteTablesResponse,
  DeleteDatabasesRequest,
  DeleteDatabasesResponse,
  CreateDatabaseRequest,
  CreateDatabaseResponse,
  SelectDatabaseRequest,
  SelectDatabaseResponse,
  EditDatabaseRequest,
  EditDatabaseResponse,
  CreateUserRequest,
  CreateUserResponse,
  EditUserRequest,
  EditUserResponse,
  DeleteUsersRequest,
  DeleteUsersResponse,
  ImportDataRequest,
  ImportDataResponse,
  CreateDataRowsRequest,
  CreateDataRowsResponse,
  DeleteDataRowsRequest,
  DeleteDataRowsResponse,
  UpdateDataRowsRequest,
  UpdateDataRowsResponse,
} from '>/services/api';
import { queryKeys, MutationCallbacks, MutationHookProps } from './defs';
import {
  defaultResponse,
  defaultCapabilities,
  defaultListResponse,
} from '>/services/utils';
import { accountStoreActions } from '>/services/stores';
import { createMutationHook } from './mutationBuilder';

const userDefaults = {
  ...defaultResponse,
};
export const useCreateUserMutation = createMutationHook<
  MutationFunction<CreateUserResponse, CreateUserRequest>
>({
  fn: dbApi.createUser,
  state: userDefaults,
  options: {
    cache: async (qc) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.users(),
      });
    },
  },
});

export const useEditUserMutation = createMutationHook<
  MutationFunction<EditUserResponse, EditUserRequest>
>({ fn: dbApi.editUser, state: userDefaults });

export const useDeleteUsersMutation = createMutationHook<
  MutationFunction<DeleteUsersResponse, DeleteUsersRequest>
>({
  fn: dbApi.deleteUsers,
  state: {
    ...defaultResponse,
    rows: [],
    columnsOrder: [],
  },
  options: {
    cache: async (qc) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.users(),
      });
    },
  },
});

const dbDefaults = {
  ...defaultResponse,
  database: 'undefined',
};
export const useEditDatabaseMutation = createMutationHook<
  MutationFunction<EditDatabaseResponse, EditDatabaseRequest>
>({
  fn: dbApi.editDatabase,
  state: dbDefaults,
  options: {
    cache: async (qc) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.databases(),
      });
    },
  },
});

export const useSelectDatabaseMutation = createMutationHook<
  MutationFunction<SelectDatabaseResponse, SelectDatabaseRequest>
>({
  fn: dbApi.selectDatabase,
  state: dbDefaults,
  options: {
    cache: async (qc, data, vars) => {
      if (!data.ok || !data.database) {
        return;
      }
      accountStoreActions.setActiveDatabase(data.database);
      await qc.invalidateQueries({
        queryKey: queryKeys.tables(data.database),
      });
    },
  },
});

export const useCreateDatabaseMutation = createMutationHook<
  MutationFunction<CreateDatabaseResponse, CreateDatabaseRequest>
>({
  fn: dbApi.createDatabase,
  state: dbDefaults,
  options: {
    cache: async (qc) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.databases(),
      });
    },
  },
});

export const useDeleteDatabasesMutation = createMutationHook<
  MutationFunction<DeleteDatabasesResponse, DeleteDatabasesRequest>
>({
  fn: dbApi.deleteDatabases,
  state: {
    ...defaultResponse,
    databases: [],
  },
  options: {
    cache: async (qc, data) => {
      const dbSelected = accountStoreActions.getActiveDatabase();
      if (dbSelected && data.databases.includes(dbSelected)) {
        accountStoreActions.setActiveDatabase(null);
      }
      await qc.invalidateQueries({
        queryKey: queryKeys.databases(),
      });
    },
  },
});

export const useDeleteTablesMutation = createMutationHook<
  MutationFunction<DeleteTablesResponse, DeleteTablesRequest>
>({
  fn: dbApi.deleteTables,
  state: {
    ...defaultResponse,
    database: 'undefined',
    tables: [],
  },
  options: {
    cache: async (qc, data) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.tables(data.database),
      });
    },
  },
});

const tableDefaults = {
  ...defaultResponse,
  database: 'undefined',
  table: 'undefined',
};

export const useCreateTableMutation = createMutationHook<
  MutationFunction<CreateTableResponse, CreateTableRequest>
>({
  fn: dbApi.createTable,
  state: tableDefaults,
  options: {
    cache: async (qc, data) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.tables(data.database),
      });
    },
  },
});

export const useEditTableMutation = createMutationHook<
  MutationFunction<EditTableResponse, EditTableRequest>
>({
  fn: dbApi.editTable,
  state: tableDefaults,
  options: {
    cache: async (qc, data) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.tables(data.database),
      });
    },
  },
});

export const useRawQueryMutation = createMutationHook<
  MutationFunction<RunRawQueryResponse, RunRawQueryRequest>
>({
  fn: dbApi.runRawQuery,
  state: {
    ...defaultResponse,
    mode: 'resultset',
    cols: {},
    rows: [],
    columnsOrder: [],
  },
  options: {
    cache: async (qc, data) => {
      accountStoreActions.setActiveDatabase(null);
      await qc.invalidateQueries({
        queryKey: queryKeys.databases(),
      });
    },
  },
});

export const useLoginMutation = createMutationHook<
  MutationFunction<LoginResponse, LoginRequest>
>({
  fn: dbApi.login,
  state: {
    ...defaultResponse,
    schemas: [],
    preferences: {},
    capabilities: defaultCapabilities,
  },
});

export const useCreateDataRowsMutation = createMutationHook<
  MutationFunction<CreateDataRowsResponse, CreateDataRowsRequest>
>({
  fn: dbApi.createDataRows,
  state: {
    ...defaultResponse,
    database: 'undefined',
    table: 'undefined',
  },
  options: {
    cache: async (qc, data) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.rows(data.database, data.table),
      });
    },
  },
});

export const useDeleteRowsMutation = createMutationHook<
  MutationFunction<DeleteDataRowsResponse, DeleteDataRowsRequest>
>({
  fn: dbApi.deleteDataRows,
  state: {
    ...tableDefaults,
  },
  options: {
    cache: async (qc, data) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.rows(data.database, data.table),
      });
    },
  },
});

export const useUpdateRowsMutation = createMutationHook<
  MutationFunction<UpdateDataRowsResponse, UpdateDataRowsRequest>
>({
  fn: dbApi.updateDataRows,
  state: {
    ...tableDefaults,
    rows: [],
  },
  options: {
    cache: async (qc, data) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.rows(data.database, data.table),
      });
    },
  },
});

export const useImportDataMutation = createMutationHook<
  MutationFunction<ImportDataResponse, ImportDataRequest>
>({
  fn: dbApi.importData,
  state: defaultResponse,
  options: {
    cache: async (qc, data) => {
      accountStoreActions.setActiveDatabase(null);
      await qc.invalidateQueries({
        queryKey: queryKeys.databases(),
      });
    },
  },
});

// type SettingsMutationProps = MutationHookProps<void, PrimeObject>;
// export const useSettingsMutation = <TSelected = SettingsMutationProps>(
//   selector?: (args: SettingsMutationProps) => TSelected,
//   callbacks?: MutationCallbacks<void, PrimeObject>,
// ) => {
//   const preferences = useAccountStore(({ state }) => state.preferences);
//   const queryClient = useQueryClient();
//   const mutation = createMutationHook(dbApi.saveSettings, undefined)(selector, {
//     ...callbacks,

//     onError:
//       callbacks?.onError ??
//       (() => {
//         queryClient.setQueryData(queryKeys.preferences(), preferences);
//       }),

//     onSettled:
//       callbacks?.onSettled ??
//       (() => {
//         queryClient.invalidateQueries({
//           queryKey: queryKeys.preferences(),
//         });
//       }),
//   });

//   return mutation;
// };
