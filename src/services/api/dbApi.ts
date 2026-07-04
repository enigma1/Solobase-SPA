import { queriesStoreActions } from '>/services/stores';
import { apiClient } from './client';
import { handleApiAxios } from './apiHelpers';
import { routes } from '>/config/routes';
import { ApiFunction } from './dbApiTypes';
import { MutationRequestMeta } from '>/services/queryHooks';

import {
  BasicResponse,
  AbortResponse,
  SessionRestoreResponse,
  LoginRequest,
  LoginResponse,
  RunQueryRequest,
  RunQueryResponse,
  RunRawQueryRequest,
  RunRawQueryResponse,
  FetchDatabasesResponse,
  FetchTablesRequest,
  FetchTablesResponse,
  FetchRowsRequest,
  FetchRowsResponse,
  FetchDatabaseInfoResponse,
  // InsertDataRowsRequest,
  // InsertDataRowsResponse,
  DeleteDataRowsRequest,
  DeleteDataRowsResponse,
  UpdateDataRowsRequest,
  UpdateDataRowsResponse,
  CreateDataRowsRequest,
  CreateDataRowsResponse,
  CreateUserRequest,
  CreateUserResponse,
  EditUserRequest,
  EditUserResponse,
  FetchUsersRequest,
  FetchUsersResponse,
  DeleteUsersRequest,
  DeleteUsersResponse,
  SelectDatabaseRequest,
  SelectDatabaseResponse,
  CreateDatabaseRequest,
  CreateDatabaseResponse,
  EditDatabaseRequest,
  EditDatabaseResponse,
  DeleteDatabasesRequest,
  DeleteDatabasesResponse,
  CreateTableRequest,
  CreateTableResponse,
  EditTableRequest,
  EditTableResponse,
  DeleteTablesRequest,
  DeleteTablesResponse,
  ExportDatabasesRequest,
  ExportDatabasesResponse,
  ImportDataRequest,
  ImportDataResponse,
  GetTableDetailsRequest,
  GetTableDetailsResponse,
  GetTableColumnsInfoRequest,
  GetTableColumnsInfoResponse,
} from './dbApiTypes';
import { PrimeObject } from '>/types';

type ApiOptions = {
  signal?: AbortSignal;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Server unreachable');
    } else {
      console.error('API error:', error.response.status);
    }
    return Promise.reject(error);
  },
);

const apiCall = <T>(fn: () => Promise<any>, unwrap = true) =>
  handleApiAxios(async () => {
    const res = await fn();
    if (Array.isArray(res.data?.queries) && res.data.queries.length) {
      queriesStoreActions.addExecutedQueries(res.data.queries);
    }
    return unwrap ? res.data : res;
  });

const ping = () => apiCall<{ ok: true }>(() => apiClient.get('/api/active'));
const checkSession = () =>
  apiCall<SessionRestoreResponse>(() => apiClient.get('/api/check-session'));

const sessionRestore = () =>
  apiCall<SessionRestoreResponse>(() => apiClient.get('/auth/presence'));

const abort = () => apiCall<AbortResponse>(() => apiClient.get('/db/abort'));

const login = (data: LoginRequest) =>
  apiCall<LoginResponse>(() => apiClient.post('/auth/login', data));
const logout = () =>
  apiCall<BasicResponse>(() => apiClient.get('/auth/logout'));

const importData = (data: ImportDataRequest, { signal }: ApiOptions) =>
  apiCall<ImportDataResponse>(() =>
    apiClient.post('/db/import-data', data, { signal, timeout: 600_000 }),
  );

const runRawQuery = (data: RunRawQueryRequest, { signal }: ApiOptions) =>
  apiCall<RunRawQueryResponse>(() =>
    apiClient.post('/db/run-raw-query', data, { timeout: 300_000, signal }),
  );

const exportDatabases = (data: ExportDatabasesRequest) =>
  apiCall(
    () =>
      apiClient.post('/db/export-databases', data, {
        responseType: 'blob',
        timeout: 0, // Let it finish
      }),
    false,
  );

const fetchUsers = () =>
  apiCall<FetchUsersResponse>(() => apiClient.get('/db/fetch-users'));
const createUser = (data: CreateUserRequest) =>
  apiCall<CreateUserResponse>(() => apiClient.post('/db/create-user', data));
const editUser = (data: EditUserRequest) =>
  apiCall<EditUserResponse>(() => apiClient.post('/db/edit-user', data));
const deleteUsers = (data: DeleteUsersRequest) =>
  apiCall<DeleteUsersResponse>(() => apiClient.post('/db/delete-users', data));

const fetchDatabases = () =>
  apiCall<FetchDatabasesResponse>(() => apiClient.get('/db/fetch-databases'));

const getTableDetails = (data: GetTableDetailsRequest) =>
  apiCall<GetTableDetailsResponse>(() =>
    apiClient.post('/db/get-table-details', data),
  );

const getTableColumnsInfo = (data: GetTableColumnsInfoRequest) =>
  apiCall<GetTableColumnsInfoResponse>(() =>
    apiClient.post('/db/get-table-columns-info', data),
  );

const fetchTables = (data: FetchTablesRequest) =>
  apiCall<FetchTablesResponse>(() => apiClient.post('/db/fetch-tables', data));

const fetchRows = (data: FetchRowsRequest) =>
  apiCall<FetchRowsResponse>(() => apiClient.post('/db/fetch-rows', data));

const createDataRows = (data: CreateDataRowsRequest) =>
  apiCall<CreateDataRowsResponse>(() =>
    apiClient.post('/db/create-data-rows', data),
  );

const deleteDataRows = (data: DeleteDataRowsRequest) =>
  apiCall<DeleteDataRowsResponse>(() =>
    apiClient.post('/db/delete-data-rows', data),
  );
const updateDataRows = (data: UpdateDataRowsRequest) =>
  apiCall<UpdateDataRowsResponse>(() =>
    apiClient.post('/db/update-data-rows', data),
  );

const fetchDatabaseInfo = () =>
  apiCall<FetchDatabaseInfoResponse>(() =>
    apiClient.get('/db/fetch-database-info'),
  );

const selectDatabase = (data: SelectDatabaseRequest) =>
  apiCall<SelectDatabaseResponse>(() =>
    apiClient.post('/db/select-database', data),
  );

const createDatabase = (data: CreateDatabaseRequest) =>
  apiCall<CreateDatabaseResponse>(() =>
    apiClient.post('/db/create-database', data),
  );

const editDatabase = (data: EditDatabaseRequest) =>
  apiCall<EditDatabaseResponse>(() =>
    apiClient.post('/db/edit-database', data),
  );

const deleteDatabases = (data: DeleteDatabasesRequest) =>
  apiCall<DeleteDatabasesResponse>(() =>
    apiClient.post('/db/delete-databases', data, { timeout: 0 }),
  );

const createTable = (data: CreateTableRequest) =>
  apiCall<CreateTableResponse>(() => apiClient.post('/db/create-table', data));

const editTable = (data: EditTableRequest) =>
  apiCall<EditTableResponse>(() => apiClient.post('/db/edit-table', data));

const deleteTables = (data: DeleteTablesRequest) =>
  apiCall<DeleteTablesResponse>(() =>
    apiClient.post('/db/delete-tables', data),
  );

const saveSettings = (data: PrimeObject) =>
  apiCall<void>(() => apiClient.post('/db/save-settings', data));
const loadSettings = () =>
  apiCall<PrimeObject>(() => apiClient.get('/db/load-settings'));

export const dbApi = {
  ping,
  checkSession,
  abort,
  getTableDetails,
  getTableColumnsInfo,
  fetchDatabaseInfo,
  sessionRestore,
  login,
  logout,
  fetchUsers,
  fetchDatabases,
  fetchTables,
  fetchRows,
  // runQuery,
  importData,
  runRawQuery,
  // insertDataRows,
  createDataRows,
  deleteDataRows,
  updateDataRows,
  createUser,
  editUser,
  selectDatabase,
  createDatabase,
  editDatabase,
  deleteDatabases,
  createTable,
  editTable,
  deleteTables,
  deleteUsers,
  saveSettings,
  loadSettings,
  exportDatabases,
} as const;
