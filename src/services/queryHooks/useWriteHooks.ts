import { useQueryClient, MutationFunction } from '@tanstack/react-query';
import { PrimeObject } from '>/types';
import { dbApi } from '>/services/api/dbApi';
import {
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
} from '>/services/api';
import { queryKeys, MutationCallbacks, MutationHookProps } from './defs';
import { useAccountStore } from '>/services/stores';
import { defaultResponse, defaultCapabilities } from '>/services/utils';
import { createMutationHook } from './mutationBuilder';

const userDefaults = {
  ...defaultResponse,
};
export const useCreateUserMutation = createMutationHook<
  MutationFunction<CreateUserResponse, CreateUserRequest>
>(dbApi.createUser, userDefaults);

export const useEditUserMutation = createMutationHook<
  MutationFunction<EditUserResponse, EditUserRequest>
>(dbApi.editUser, userDefaults);

export const useDeleteUsersMutation = createMutationHook<
  MutationFunction<DeleteUsersResponse, DeleteUsersRequest>
>(dbApi.deleteUsers, {
  ...defaultResponse,
  rows: [],
  columnsOrder: [],
});

const dbDefaults = {
  ...defaultResponse,
  database: 'undefined',
};
export const useEditDatabaseMutation = createMutationHook<
  MutationFunction<EditDatabaseResponse, EditDatabaseRequest>
>(dbApi.editDatabase, dbDefaults);

export const useSelectDatabaseMutation = createMutationHook<
  MutationFunction<SelectDatabaseResponse, SelectDatabaseRequest>
>(dbApi.selectDatabase, dbDefaults);

export const useCreateDatabaseMutation = createMutationHook<
  MutationFunction<CreateDatabaseResponse, CreateDatabaseRequest>
>(dbApi.createDatabase, dbDefaults);

export const useDeleteDatabasesMutation = createMutationHook<
  MutationFunction<DeleteDatabasesResponse, DeleteDatabasesRequest>
>(dbApi.deleteDatabases, {
  ...defaultResponse,
  databases: [],
});

export const useDeleteTablesMutation = createMutationHook<
  MutationFunction<DeleteTablesResponse, DeleteTablesRequest>
>(dbApi.deleteTables, {
  ...defaultResponse,
  database: 'undefined',
  tables: [],
});

const tableDefaults = {
  ...defaultResponse,
  database: 'undefined',
  table: 'undefined',
};

export const useCreateTableMutation = createMutationHook<
  MutationFunction<CreateTableResponse, CreateTableRequest>
>(dbApi.createTable, tableDefaults);

export const useEditTableMutation = createMutationHook<
  MutationFunction<EditTableResponse, EditTableRequest>
>(dbApi.editTable, tableDefaults);

export const useRawQueryMutation = createMutationHook<
  MutationFunction<RunRawQueryResponse, RunRawQueryRequest>
>(dbApi.runRawQuery, {
  ...defaultResponse,
  mode: 'resultset',
  cols: {},
  rows: [],
  columnsOrder: [],
});

export const useLoginMutation = createMutationHook<
  MutationFunction<LoginResponse, LoginRequest>
>(dbApi.login, {
  ...defaultResponse,
  schemas: [],
  preferences: {},
  capabilities: defaultCapabilities,
});

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

export const useImportDataMutation = createMutationHook<
  MutationFunction<ImportDataResponse, ImportDataRequest>
>(dbApi.importData, defaultResponse);

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
